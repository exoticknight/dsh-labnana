// dsh-labnana — Labnana 图片生成插件（Host 端，TypeScript）
// 为模型提供 labnana_generate_image / labnana_estimate_credits /
// labnana_get_subscription / labnana_get_task 工具；注册 labnana settings
// namespace（apiKeyEnv 引用 + saveToDisk）与 /api/dsh-labnana-settings/test、
// /api/dsh-labnana-images（图片服务 + 手动保存）端点。
import type { Context } from "@deepseek-ai/cordis";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import { defineTool } from "@deepseek-ai/dsh-tools";
import type { ToolRunContext } from "@deepseek-ai/dsh-tools";
import z from "@deepseek-ai/schemastery";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

//#region 常量
const BASE_URL = "https://api.labnana.com";
const EP_GENERATION = "/openapi/v1/images/generation";
const EP_ASYNC = "/openapi/v1/images/generation/async";
const EP_TASKS = "/openapi/v1/images/generation/tasks";
const EP_SUBSCRIPTION = "/openapi/v1/user/subscription";
const EP_ESTIMATE = "/openapi/v1/images/generation/estimate-credits";

const NS = settingsNamespace("labnana");
const BRIDGE_PREFIX = "/api/dsh-labnana-settings";
const IMAGE_PREFIX = "/api/dsh-labnana-images";
const PLUGIN_VERSION = "0.3.0";

// 已生成图片索引：filename -> 绝对路径（供图片服务端点在进程内快速定位生成图）
const SAVED_IMAGES = new Map<string, string>();
// filename -> 生成时的会话工作区（供"保存到项目"端点定位目标目录）
const SAVED_WORKSPACES = new Map<string, string>();
// 已知保存目录集合（供图片服务跨会话/跨目录查找生成图）
const SAVED_DIRS = new Set<string>();
// 未保存模式（saveToDisk=false）的图片驻留内存：filename -> { data: base64, mimeType, size }
// 零落盘：图片只存在于进程内存，由图片服务直接返回；"保存到项目"时才写盘。
const IN_MEMORY_IMAGES = new Map<string, { data: string; mimeType: string; size: number }>();

interface ModelMeta {
  provider: "google" | "openai" | "alibaba" | "bytedance";
  credits: Partial<Record<"1K" | "2K" | "4K", number>>;
  maxRef: number;
  sizes: string[];
  refNo4k?: true;
}

// 模型元数据：provider 映射、积分（1K/2K/4K）、参考图上限、可用尺寸
const MODELS: Record<string, ModelMeta> = {
  "gemini-3-pro-image": { provider: "google", credits: { "1K": 15, "2K": 15, "4K": 30 }, maxRef: 14, sizes: ["1K", "2K", "4K"] },
  "gemini-3.1-flash-image": { provider: "google", credits: { "1K": 10, "2K": 10, "4K": 20 }, maxRef: 14, sizes: ["1K", "2K", "4K"] },
  "gpt-image-2": { provider: "openai", credits: { "1K": 4, "2K": 6, "4K": 10 }, maxRef: 4, sizes: ["1K", "2K", "4K"] },
  "wan2.7-image-pro": { provider: "alibaba", credits: { "1K": 6, "2K": 8, "4K": 12 }, maxRef: 9, sizes: ["1K", "2K", "4K"], refNo4k: true },
  "wan2.7-image": { provider: "alibaba", credits: { "1K": 4, "2K": 6 }, maxRef: 9, sizes: ["1K", "2K"] },
  "seedream-5-0-pro": { provider: "bytedance", credits: { "1K": 6, "2K": 15 }, maxRef: 10, sizes: ["1K", "2K"] },
};

const ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9", "1:4", "4:1", "1:8", "8:1"];
const IMAGE_SIZES = ["1K", "2K", "4K"];

const ERROR_CODES: Record<number, string> = {
  21007: "API Key 无效（Invalid API Key）",
  26004: "积分不足（Insufficient credits）",
  29003: "参数错误（Invalid parameters）",
  29998: "请求过于频繁（Too many requests），建议等待 20-30 秒后重试",
};

const MIME_EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
const EXT_MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };
//#endregion

//#region 工具函数
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 带超时的 fetch（返回 Response）
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// 调用 Labnana API：非 2xx 统一解析 {code, message} 并抛带 code 的错误
async function callApi(key: string, method: "GET" | "POST", apiPath: string, body: unknown, timeoutMs: number): Promise<any> {
  const headers: Record<string, string> = { Authorization: `Bearer ${key}` };
  let init: RequestInit;
  if (method === "GET") {
    init = { method, headers };
  } else {
    headers["Content-Type"] = "application/json";
    init = { method, headers, body: JSON.stringify(body) };
  }
  let response: Response;
  try {
    response = await fetchWithTimeout(`${BASE_URL}${apiPath}`, init, timeoutMs);
  } catch (error: any) {
    if (error?.name === "AbortError") {
      const err = new Error(`labnana: request timed out after ${Math.round(timeoutMs / 1000)}s`);
      (err as any).code = "TIMEOUT";
      throw err;
    }
    const err = new Error(`labnana: network error - ${error?.message ?? String(error)}`);
    (err as any).code = "NETWORK";
    throw err;
  }
  let payload: any = null;
  try {
    payload = await response.json();
  } catch {}
  if (!response.ok || (payload && typeof payload.code === "number" && payload.code !== 0)) {
    const code = payload?.code ?? "HTTP";
    const message = payload?.message ?? `HTTP ${response.status}`;
    const err = new Error(`labnana: [${code}] ${ERROR_CODES[code] ?? message}`);
    (err as any).code = String(code);
    (err as any).rawMessage = message;
    throw err;
  }
  return payload?.data ?? payload ?? null;
}

// 从 credentials 域解析环境变量名引用的凭据值（resolve 返回 {value, source}）
async function resolveCredentialValue(ctx: Context, envName: string): Promise<string | undefined> {
  const credentials = ctx.get("credentials");
  if (credentials === undefined) return undefined;
  try {
    const resolved = await (credentials as any).resolve(envName);
    if (resolved && typeof resolved.value === "string" && resolved.value.length > 0) return resolved.value;
  } catch {}
  return undefined;
}

// key 解析优先级（官方模式：配置只携带对机密的引用，绝不携带机密本身）：
// 1) settings.labnana.apiKeyEnv（环境变量名引用，值存 credentials 域，回退进程环境）
// 2) 默认引用 LABNANA_API_KEY（credentials 域 > 进程环境）
async function resolveKey(ctx: Context, config: Partial<LabnanaConfig>): Promise<string> {
  const cfg = config ?? {};
  if (typeof cfg.apiKeyEnv === "string" && cfg.apiKeyEnv.length > 0) {
    const viaCred = await resolveCredentialValue(ctx, cfg.apiKeyEnv);
    if (viaCred) return viaCred;
    const fromEnv = process.env[cfg.apiKeyEnv];
    if (fromEnv) return fromEnv;
  }
  const viaDefault = await resolveCredentialValue(ctx, "LABNANA_API_KEY");
  if (viaDefault) return viaDefault;
  return process.env.LABNANA_API_KEY ?? "";
}

async function resolveKeyAsync(ctx: Context, config: Partial<LabnanaConfig>): Promise<string> {
  return resolveKey(ctx, config);
}

// 脱敏预览：只露头尾（绝不返回密钥本体）
function maskKey(key: string): string {
  if (!key || key.length === 0) return "";
  if (key.length <= 10) return `${key.slice(0, 2)}…${key.slice(-2)}`;
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

interface KeyState {
  configured: boolean;
  source: "credentials" | "env" | "none";
  ref?: string;
  masked: string;
}

// key 状态（供设置 UI 展示，不泄露密钥）
async function keyStateOf(ctx: Context, config: Partial<LabnanaConfig>): Promise<KeyState> {
  const cfg = config ?? {};
  if (typeof cfg.apiKeyEnv === "string" && cfg.apiKeyEnv.length > 0) {
    const viaCred = await resolveCredentialValue(ctx, cfg.apiKeyEnv);
    if (typeof viaCred === "string" && viaCred.length > 0) {
      return { configured: true, source: "credentials", ref: cfg.apiKeyEnv, masked: maskKey(viaCred) };
    }
    const fromEnv = process.env[cfg.apiKeyEnv];
    if (fromEnv) {
      return { configured: true, source: "env", ref: cfg.apiKeyEnv, masked: maskKey(fromEnv) };
    }
  }
  try {
    const resolved = await resolveKeyAsync(ctx, cfg);
    if (typeof resolved === "string" && resolved.length > 0) {
      return { configured: true, source: "env", ref: "LABNANA_API_KEY", masked: maskKey(resolved) };
    }
  } catch {}
  return { configured: false, source: "none", masked: "" };
}

// 确保 key 非空并返回，否则抛 21007 风格错误
function requireKey(key: string): string {
  if (!key || key.length === 0) {
    const err = new Error(
      "labnana: API key 未配置。请在 设置 → 插件 → Labnana 卡片 填写 API Key（存于凭据域），或设置 LABNANA_API_KEY 环境变量（https://labnana.com/api-keys）"
    ) as Error & { code: string };
    err.code = "21007";
    throw err;
  }
  return key;
}

type RefImage = { fileData: { fileUri: string; mimeType: string } } | { inlineData: { data: string; mimeType: string } };

// 从路径/URL/base64 组装参考图条目；返回 {ok, value|error}
function buildReferenceImage(entry: unknown, index: number): { ok: true; value: RefImage } | { ok: false; error: string } {
  if (entry === null || typeof entry !== "object") {
    return { ok: false, error: `referenceImages[${index}] 必须是对象 { url | filePath | data+mimeType }` };
  }
  const e = entry as Record<string, unknown>;
  // 1) 远程 URL（https / gs）
  if (typeof e.url === "string" && e.url.length > 0) {
    const mime = typeof e.mimeType === "string" ? e.mimeType : "image/png";
    return { ok: true, value: { fileData: { fileUri: e.url, mimeType: mime } } };
  }
  // 2) 本地文件路径 → 读文件转 base64（<15MB，超出提示用 URL）
  if (typeof e.filePath === "string" && e.filePath.length > 0) {
    try {
      const stat = fs.statSync(e.filePath);
      if (stat.size > 15 * 1024 * 1024) {
        return { ok: false, error: `referenceImages[${index}] 本地文件超过 15MB（${e.filePath}），请先上传或使用 URL` };
      }
      const data = fs.readFileSync(e.filePath).toString("base64");
      const ext = path.extname(e.filePath).slice(1).toLowerCase();
      const mime = EXT_MIME[ext] ?? (typeof e.mimeType === "string" ? e.mimeType : "image/png");
      return { ok: true, value: { inlineData: { data, mimeType: mime } } };
    } catch (error: any) {
      return { ok: false, error: `referenceImages[${index}] 读取本地文件失败: ${error?.message ?? String(error)}` };
    }
  }
  // 3) base64 data + mimeType
  if (typeof e.data === "string" && e.data.length > 0) {
    return { ok: true, value: { inlineData: { data: e.data, mimeType: typeof e.mimeType === "string" ? e.mimeType : "image/png" } } };
  }
  return { ok: false, error: `referenceImages[${index}] 需提供 url / filePath / data 之一` };
}

// 生成保存目录优先链：saveDir > config.outputDir > <会话工作区>/labnana-images > <cwd>/labnana-images
// 会话工作区 = 当前项目的绝对路径（session.header.cwd），避免落到 dsh 安装/打包目录。
function resolveOutputDir(config: Partial<LabnanaConfig>, saveDir?: string, workspaceCwd?: string): string {
  if (saveDir && saveDir.length > 0) return path.resolve(saveDir);
  if (config?.outputDir && config.outputDir.length > 0) return path.resolve(config.outputDir);
  const base = workspaceCwd && workspaceCwd.length > 0 ? workspaceCwd : process.cwd();
  return path.join(base, "labnana-images");
}

function timestampName(ext: string): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `labnana-${stamp}-${crypto.randomBytes(3).toString("hex")}.${ext}`;
}

interface SavedImage {
  path: string;
  mimeType: string;
  size: number;
}

// 把 base64 图片写入目录，返回 { path, mimeType, size }
function saveBase64Image(dir: string, data: string, mimeType: string): SavedImage {
  const ext = MIME_EXT[mimeType] ?? "png";
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, timestampName(ext));
  const buffer = Buffer.from(data, "base64");
  fs.writeFileSync(file, buffer);
  return { path: file, mimeType, size: buffer.length };
}

// 下载远程图片（异步任务产物）并保存
async function downloadImage(dir: string, url: string, mimeType: string, timeoutMs: number): Promise<SavedImage> {
  const response = await fetchWithTimeout(url, {}, timeoutMs);
  if (!response.ok) throw new Error(`labnana: 下载生成图片失败 HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = MIME_EXT[mimeType] ?? "png";
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, timestampName(ext));
  fs.writeFileSync(file, buffer);
  return { path: file, mimeType, size: buffer.length };
}

// 从候选输出目录中按文件名找回图片绝对路径（历史图 / 跨进程图）
// 候选：config.outputDir > <cwd>/labnana-images > 本进程用过的保存目录 > extraDirs（如已注册 workspace 的 labnana-images）
function findSavedImage(name: string, cfg: Partial<LabnanaConfig> = {}, extraDirs: string[] = []): string | undefined {
  const dirs: string[] = [];
  if (typeof cfg.outputDir === "string" && cfg.outputDir.length > 0) dirs.push(cfg.outputDir);
  dirs.push(path.join(process.cwd(), "labnana-images"));
  for (const dir of SAVED_DIRS) dirs.push(dir);
  for (const dir of extraDirs) dirs.push(dir);
  const seen = new Set<string>();
  for (const dir of dirs) {
    const abs = path.resolve(dir);
    if (seen.has(abs)) continue;
    seen.add(abs);
    try {
      const candidate = path.join(abs, name);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    } catch {}
  }
  return undefined;
}

// 已注册 workspace 的 labnana-images 目录（重启后回放也能 serve 历史图）
function workspaceImageDirs(ctx: Context): string[] {
  const dirs: string[] = [];
  try {
    const registry = ctx.get("workspaceRegistry") as { list?: () => Array<{ path?: string }> } | undefined;
    if (registry && typeof registry.list === "function") {
      for (const ws of registry.list()) {
        if (ws && typeof ws.path === "string" && ws.path.length > 0) dirs.push(path.join(ws.path, "labnana-images"));
      }
    }
  } catch {}
  return dirs;
}

// 从同步生图响应提取 base64 图片（兼容 candidates/parts 结构）
function extractInlineImage(payload: any): { data: string; mimeType: string } | null {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts)) continue;
    for (const part of parts) {
      if (part?.inlineData?.data) {
        return { data: part.inlineData.data, mimeType: part.inlineData.mimeType ?? "image/png" };
      }
    }
  }
  return null;
}

// 轮询异步任务直到成功/失败或超时；返回 { status, images, failMsg, createdAt, completedAt }
async function pollTask(key: string, taskId: string, waitSeconds: number, timeoutMs: number): Promise<any> {
  const deadline = Date.now() + waitSeconds * 1000;
  let last: any = null;
  while (Date.now() < deadline) {
    const data = await callApi(key, "GET", `${EP_TASKS}/${taskId}`, null, timeoutMs);
    last = data;
    if (data?.status === "success" || data?.status === "fail") return data;
    await sleep(3000);
  }
  const err = new Error(
    `labnana: 异步任务 ${taskId} 在 ${waitSeconds}s 内未完成（当前状态: ${last?.status ?? "unknown"}）。可用 labnana_get_task 工具继续查询 taskId=${taskId}`
  ) as Error & { code: string; taskId: string };
  err.code = "TASK_TIMEOUT";
  err.taskId = taskId;
  throw err;
}

interface GenerateArgs {
  prompt: string;
  model?: string;
  imageSize?: string;
  aspectRatio?: string;
  referenceImages?: unknown[];
  outputMode?: string;
  saveDir?: string;
  async?: boolean;
  waitSeconds?: number;
}

interface GeneratePayload {
  provider: string;
  model: string;
  prompt: string;
  imageConfig: { imageSize: string; aspectRatio?: string };
  referenceImages?: RefImage[];
}

// 组装生图请求体（顶层，纯函数）
function buildPayload(args: GenerateArgs, cfg: Partial<LabnanaConfig>): GeneratePayload {
  const model = args.model ?? cfg?.defaultModel ?? "gemini-3-pro-image";
  const meta = MODELS[model];
  if (!meta) {
    throw new Error(`labnana: 未知模型 "${model}"，可选: ${Object.keys(MODELS).join(" / ")}`);
  }
  const imageSize = args.imageSize ?? cfg?.defaultImageSize ?? "2K";
  if (!meta.sizes.includes(imageSize)) {
    throw new Error(`labnana: 模型 ${model} 不支持 ${imageSize}，仅支持 ${meta.sizes.join(" / ")}`);
  }
  const aspectRatio = args.aspectRatio ?? cfg?.defaultAspectRatio ?? "1:1";
  const payload: GeneratePayload = {
    provider: meta.provider,
    model,
    prompt: String(args.prompt ?? ""),
    imageConfig: { imageSize },
  };
  if (aspectRatio && aspectRatio !== "auto") payload.imageConfig.aspectRatio = aspectRatio;

  const refs = Array.isArray(args.referenceImages) ? args.referenceImages : [];
  if (refs.length > 0) {
    if (refs.length > meta.maxRef) {
      throw new Error(`labnana: 模型 ${model} 最多支持 ${meta.maxRef} 张参考图，收到 ${refs.length} 张`);
    }
    const built: RefImage[] = [];
    for (let i = 0; i < refs.length; i++) {
      const r = buildReferenceImage(refs[i], i);
      if (!r.ok) throw new Error(r.error);
      built.push(r.value);
    }
    payload.referenceImages = built;
    // wan2.7-image-pro 带参考图不支持 4K
    if (imageSize === "4K" && meta.refNo4k) {
      throw new Error(`labnana: wan2.7-image-pro 带参考图时不支持 4K，请使用 1K/2K`);
    }
  }
  return payload;
}

interface SubscriptionSummary {
  totalAvailableCredits?: number;
  monthlyAvailable?: number;
  monthlyTotal?: number;
  permanentAvailable?: number;
  limitedTimeAvailable?: number;
  renewStatus?: boolean;
  paidStatus?: boolean;
  freeUsages?: Array<{ resourceKey: string; remaining: number; unlimited: boolean; unit: string }>;
  plan?: string;
  planDuration?: string;
  subscriptionExpiresAt?: number;
}

// 订阅/余额摘要（顶层，纯函数）
async function subscriptionSummary(key: string): Promise<SubscriptionSummary> {
  const data = await callApi(key, "GET", EP_SUBSCRIPTION, null, 20000);
  if (!data) return {};
  const free: NonNullable<SubscriptionSummary["freeUsages"]> = [];
  const freeUsages = data.freeUsages ?? {};
  for (const [k, v] of Object.entries(freeUsages)) {
    if (v && typeof v === "object" && (v as any).remaining !== undefined) {
      free.push({
        resourceKey: (v as any).resourceKey ?? k,
        remaining: (v as any).remaining,
        unlimited: (v as any).unlimited === true,
        unit: (v as any).unit ?? "generation",
      });
    }
  }
  const out: SubscriptionSummary = {
    totalAvailableCredits: data.totalAvailableCredits ?? 0,
    monthlyAvailable: data.usageAvailableMonthlyCredits ?? 0,
    monthlyTotal: data.usageTotalMonthlyCredits ?? 0,
    permanentAvailable: data.usageAvailablePermanentCredits ?? 0,
    limitedTimeAvailable: data.usageAvailableLimitedTimeCredits ?? 0,
    renewStatus: data.renewStatus === true,
    paidStatus: data.paidStatus === true,
    freeUsages: free,
  };
  if (data.subscriptionPlan && typeof data.subscriptionPlan === "object") {
    out.plan = data.subscriptionPlan.name ?? "";
    out.planDuration = data.subscriptionPlan.duration ?? "";
  }
  if (typeof data.subscriptionExpiresAt === "number" && data.subscriptionExpiresAt > 0) {
    out.subscriptionExpiresAt = data.subscriptionExpiresAt;
  }
  return out;
}
//#endregion

//#region 插件声明
const name = "dsh-labnana";
const inject: string[] = [];

interface LabnanaConfig {
  apiKeyEnv: string;
  saveToDisk: boolean;
  defaultModel: string;
  defaultImageSize: string;
  defaultAspectRatio: string;
  outputDir: string;
  timeoutSeconds: number;
}

const Config: z<LabnanaConfig> = z.object({
  // 官方模式：settings 只携带对机密的引用（环境变量名），值存 credentials 域
  apiKeyEnv: z.string().default(""),
  // 默认不保存图片到磁盘；勾选后每次生成自动保存到项目 labnana-images/
  saveToDisk: z.boolean().default(false),
  defaultModel: z.string().default("gemini-3-pro-image"),
  defaultImageSize: z.string().default("2K"),
  defaultAspectRatio: z.string().default("1:1"),
  outputDir: z.string().default(""),
  timeoutSeconds: z.number().default(120),
});

interface SystemPromptSectionService {
  section(options: { name: string; order: number; text: string }): () => void;
}

interface HttpServerContext {
  webServer: {
    register(route: {
      kind: "exact" | "prefix";
      path: string;
      handler: (req: any, res: any) => void;
    }): () => void;
  };
}

function apply(ctx: Context, config: LabnanaConfig) {
  let current = () => config ?? {};
  const logger = ctx.logger;

  // 刷新系统提示词（settings 变更时）
  let refreshPrompt: (() => void) | null = null;

  installSettingsSection(ctx, NS, Config, config ?? {}, {
    setSource: (source) => {
      current = source;
    },
    onChange: () => {
      if (typeof refreshPrompt === "function") refreshPrompt();
    },
  });

  //#region 核心业务
  interface GenImageOut {
    ok: true;
    model: string;
    imageSize: string;
    aspectRatio: string;
    saved?: boolean;
    taskId?: string;
    message?: string;
    images: Array<{
      mimeType: string;
      path?: string;
      name?: string;
      url?: string;
      data?: string;
      size?: number;
    }>;
  }

  // 生图主流程：4K（或 async=true）走异步任务 + 轮询；否则同步
  async function generateImage(args: GenerateArgs, cfg: Partial<LabnanaConfig>, key: string, workspaceCwd: string): Promise<GenImageOut> {
    const payload = await buildPayload(args, cfg);
    const model = payload.model;
    const imageSize = payload.imageConfig.imageSize;
    const waitSeconds = Math.min(Math.max(Number(args.waitSeconds ?? 180) || 180, 10), 600);
    const timeoutMs = Math.min(Math.max(Number(cfg.timeoutSeconds ?? 120) || 120, 15), 300) * 1000;
    const outputMode = args.outputMode === "inline" ? "inline" : "file";
    // 保存策略：显式 saveDir > 设置 saveToDisk（默认 false = 只生成不落盘，驻留内存等手动保存）
    const persist = Boolean(args.saveDir && args.saveDir.length > 0) || cfg.saveToDisk === true;
    const dir = persist ? resolveOutputDir(cfg, args.saveDir, workspaceCwd) : "";
    try {
      if (dir) SAVED_DIRS.add(path.resolve(dir));
    } catch {}

    const useAsync = args.async === true || imageSize === "4K";
    let result: { images: Array<{ name?: string; path?: string; data?: string; mimeType: string; size: number }> };
    let taskId: string | null = null;

    if (useAsync) {
      const created = await callApi(key, "POST", EP_ASYNC, payload, timeoutMs);
      taskId = created?.taskId;
      if (!taskId) throw new Error("labnana: 异步任务创建失败（未返回 taskId）");
      const done = await pollTask(key, taskId, waitSeconds, timeoutMs);
      if (done?.status !== "success") {
        throw new Error(`labnana: 异步任务失败（${done?.status}）${done?.failMsg ? `: ${done.failMsg}` : ""}`);
      }
      const images = Array.isArray(done.images) ? done.images : [];
      if (images.length === 0) throw new Error("labnana: 任务成功但未返回图片");
      if (outputMode === "inline") {
        // inline：下载第一张并转 base64
        const first = images[0];
        const response = await fetchWithTimeout(first.url, {}, timeoutMs);
        if (!response.ok) throw new Error(`labnana: 下载图片失败 HTTP ${response.status}`);
        const buf = Buffer.from(await response.arrayBuffer());
        result = {
          images: [{ data: buf.toString("base64"), mimeType: first.mimeType ?? "image/png", size: buf.length }],
        };
      } else if (persist) {
        const saved: Array<{ name?: string; path?: string; data?: string; mimeType: string; size: number }> = [];
        for (const img of images) {
          const s = await downloadImage(dir, img.url, img.mimeType ?? "image/png", timeoutMs);
          saved.push({ ...s });
        }
        result = { images: saved };
      } else {
        // 未保存模式：图片驻留内存，零落盘
        const saved: Array<{ name?: string; path?: string; data?: string; mimeType: string; size: number }> = [];
        for (const img of images) {
          const response = await fetchWithTimeout(img.url, {}, timeoutMs);
          if (!response.ok) throw new Error(`labnana: 下载图片失败 HTTP ${response.status}`);
          const buf = Buffer.from(await response.arrayBuffer());
          const n = timestampName(MIME_EXT[img.mimeType ?? "image/png"] ?? "png");
          IN_MEMORY_IMAGES.set(n, { data: buf.toString("base64"), mimeType: img.mimeType ?? "image/png", size: buf.length });
          saved.push({ name: n, mimeType: img.mimeType ?? "image/png", size: buf.length });
        }
        result = { images: saved };
      }
    } else {
      const data = await callApi(key, "POST", EP_GENERATION, payload, timeoutMs);
      const image = extractInlineImage(data);
      if (!image) {
        // 兼容：有些失败可能以 200 返回非图片结构
        throw new Error("labnana: 响应中未找到图片数据（请检查 prompt 与模型限制）");
      }
      if (outputMode === "inline") {
        result = { images: [{ data: image.data, mimeType: image.mimeType, size: Math.floor(image.data.length * 0.75) }] };
      } else if (persist) {
        const saved = saveBase64Image(dir, image.data, image.mimeType);
        result = { images: [{ ...saved }] };
      } else {
        // 未保存模式：图片驻留内存，零落盘
        const n = timestampName(MIME_EXT[image.mimeType] ?? "png");
        IN_MEMORY_IMAGES.set(n, { data: image.data, mimeType: image.mimeType, size: Math.floor(image.data.length * 0.75) });
        result = { images: [{ name: n, mimeType: image.mimeType, size: Math.floor(image.data.length * 0.75) }] };
      }
    }

    // 组装返回值（lossless JSON，无 undefined 字段）
    const out: GenImageOut = {
      ok: true,
      model,
      imageSize,
      aspectRatio: payload.imageConfig.aspectRatio ?? "",
      images: result.images.map((img) => {
        const item: GenImageOut["images"][number] = { mimeType: img.mimeType };
        if (typeof img.path === "string") {
          item.path = img.path;
          const n = path.basename(img.path);
          SAVED_IMAGES.set(n, img.path);
          if (workspaceCwd && workspaceCwd.length > 0) SAVED_WORKSPACES.set(n, workspaceCwd);
          item.url = `${IMAGE_PREFIX}/${encodeURIComponent(n)}`;
        } else if (typeof img.name === "string" && img.name.length > 0) {
          item.url = `${IMAGE_PREFIX}/${encodeURIComponent(img.name)}`;
        }
        if (typeof img.data === "string") item.data = img.data;
        if (typeof img.size === "number") item.size = img.size;
        return item;
      }),
    };
    if (taskId) out.taskId = taskId;
    if (outputMode === "inline") {
      out.message = "inline 模式：图片以 base64 返回（data 字段）";
    } else {
      out.saved = persist;
      if (persist) {
        out.message = `图片已保存到 ${result.images.length} 个文件（${dir}）`;
      } else {
        out.message = `图片已生成（${result.images.length} 张，驻留内存未落盘；对话卡片可点击"保存到项目"）`;
      }
    }
    return out;
  }

  // 当前会话工作区（项目根），作为默认保存目录基准
  function sessionCwdOf(exec: ToolRunContext): string {
    const agent = exec.agent as { session?: { header?: { cwd?: string } } } | undefined;
    return agent?.session?.header?.cwd ?? "";
  }
  //#endregion

  //#region 工具注册
  ctx.inject(["tools"], (sctx) => {
    sctx.effect(() => {
      const disposers: Array<() => void> = [];

      disposers.push(
        sctx.tools.register(
          defineTool({
            name: "labnana_generate_image",
            description:
              "Generate an image via the Labnana API (text-to-image / image-to-image / precise editing). Supports models: gemini-3-pro-image (NanoBanana Pro), gemini-3.1-flash-image, gpt-image-2, wan2.7-image-pro, wan2.7-image, seedream-5-0-pro. Pass referenceImages for image-to-image or editing (url = remote image, filePath = local file, data = base64). 4K and async=true run as async tasks with internal polling. By default the image is NOT saved to disk (kept in memory only; the conversation card offers a 'save to project' button) unless the user enabled 'save to disk' in settings or you pass saveDir. Returns { ok, saved, images: [{url, path?, mimeType, size}], model, imageSize, aspectRatio, taskId? }.",
            parameters: {
              prompt: { type: "string", required: true, description: "Image generation prompt (Chinese or English). For Seedream precise editing, describe the region (absolute pixel coords from top-left) and the change." },
              model: { type: "string", description: "Model id (default: gemini-3-pro-image). gemini-3-pro-image / gemini-3.1-flash-image / gpt-image-2 / wan2.7-image-pro / wan2.7-image / seedream-5-0-pro" },
              imageSize: { type: "string", description: "1K | 2K | 4K (default 2K; wan2.7-image and seedream-5-0-pro do not support 4K)" },
              aspectRatio: { type: "string", description: "One of 1:1 2:3 3:2 3:4 4:3 9:16 16:9 21:9 1:4 4:1 1:8 8:1, or 'auto' to let the model choose (default 1:1)" },
              referenceImages: {
                type: "array",
                description: "Optional reference images for image-to-image / editing. Each item: { url } (remote https/gs URL + optional mimeType), { filePath } (local file), or { data, mimeType } (base64). Limits: Gemini 14, GPT-Image-2 4, Wan2.7 9, Seedream 10.",
                items: { type: "json" },
              },
              outputMode: { type: "string", description: "'file' (default) saves to disk; 'inline' returns base64 data." },
              saveDir: { type: "string", description: "Optional directory to save images (default: <config outputDir> or <workspace>/labnana-images)." },
              async: { type: "boolean", description: "Force async task mode (4K already runs async automatically)." },
              waitSeconds: { type: "number", description: "Max wait for async tasks in seconds (default 180, range 10-600)." },
            },
            output: {
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  ok: { type: "boolean" },
                  message: { type: "string" },
                  model: { type: "string" },
                  imageSize: { type: "string" },
                  aspectRatio: { type: "string" },
                  taskId: { type: "string" },
                  saved: { type: "boolean" },
                  images: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        path: { type: "string" },
                        data: { type: "string" },
                        url: { type: "string" },
                        mimeType: { type: "string" },
                        size: { type: "number" },
                      },
                    },
                  },
                },
              },
              render(args, value) {
                const lines = (value.images ?? []).map((img, i) => {
                  const where = img.path ? `path=${img.path}` : img.data ? `base64 (${Math.floor((img.data?.length ?? 0) / 1024)}KB)` : "";
                  return `- image[${i}]: ${img.mimeType ?? ""}${where ? ` ${where}` : ""}`;
                });
                return [{
                  type: "text",
                  text: `Labnana generate (${value.model ?? ""}, ${value.imageSize ?? ""}${value.aspectRatio ? `, ${value.aspectRatio}` : ""}):\n${lines.join("\n") || "no images"}${value.taskId ? `\ntaskId=${value.taskId}` : ""}`,
                }];
              },
              // presentationMeta：把结果期事实（图片 URL/路径等）投影为可回放 JSON，
              // 核心持久化到 tool/result.meta，供 client toolview 卡片（tool.call.toolview）重建。
              // 纯函数：只从 args + 规范值派生，无 I/O、无时钟。
              presentationMeta(args, value) {
                const images = Array.isArray(value?.images) ? value.images : [];
                return {
                  model: typeof value?.model === "string" ? value.model : "",
                  imageSize: typeof value?.imageSize === "string" ? value.imageSize : "",
                  aspectRatio: typeof value?.aspectRatio === "string" ? value.aspectRatio : "",
                  taskId: typeof value?.taskId === "string" ? value.taskId : "",
                  saved: value?.saved === true,
                  images: images.map((img) => ({
                    ...(typeof img?.url === "string" ? { url: img.url } : {}),
                    ...(typeof img?.path === "string" ? { path: img.path } : {}),
                    ...(typeof img?.mimeType === "string" ? { mimeType: img.mimeType } : {}),
                    ...(typeof img?.size === "number" ? { size: img.size } : {}),
                  })),
                };
              },
            },
            presentCall(args) {
              return {
                card: "generic",
                title: `生成图片 · ${args.model ?? "gemini-3-pro-image"} ${args.imageSize ?? "2K"}`,
                rawInput: typeof args.prompt === "string" ? args.prompt : "",
              };
            },
            presentResult(args, result) {
              if (result.isError) {
                return { card: "generic", title: `生成图片失败 · ${(result.content as any)?.[0]?.text ?? ""}`, kind: "generic" };
              }
              const value = (result.meta ?? {}) as any;
              const images = Array.isArray(value.images) ? value.images : [];
              return {
                card: "generic",
                title: `已生成 ${images.length} 张 · ${value.model ?? ""} ${value.imageSize ?? ""}${value.aspectRatio ? ` ${value.aspectRatio}` : ""}`,
                kind: "generic",
                content: images.map((img: any) => img.path ?? img.url ?? "").filter(Boolean).join("\n"),
                locations: images.map((img: any) => (img.path ? { path: img.path } : undefined)).filter(Boolean),
              };
            },
            async execute(args, exec) {
              const key = requireKey(await resolveKeyAsync(ctx, current()));
              return await generateImage(args, current(), key, sessionCwdOf(exec));
            },
          })
        )
      );

      disposers.push(
        sctx.tools.register(
          defineTool({
            name: "labnana_estimate_credits",
            description:
              "Estimate how many Labnana credits a generation would cost WITHOUT generating the image or spending credits. Returns credits, canGenerate, requiresSubscription, pricing and warnings.",
            parameters: {
              prompt: { type: "string", required: true, description: "The prompt you plan to use (length can affect pricing)." },
              model: { type: "string", description: "Model id (default: gemini-3-pro-image)." },
              imageSize: { type: "string", description: "1K | 2K | 4K (default 2K)." },
              aspectRatio: { type: "string", description: "Aspect ratio (default 1:1)." },
            },
            output: {
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  ok: { type: "boolean" },
                  model: { type: "string" },
                  imageSize: { type: "string" },
                  aspectRatio: { type: "string" },
                  credits: { type: "number" },
                  canGenerate: { type: "boolean" },
                  requiresSubscription: { type: "boolean" },
                  warnings: { type: "array", items: { type: "string" } },
                },
              },
              render(args, value) {
                return [{
                  type: "text",
                  text: `Labnana estimate (${value.model ?? ""}, ${value.imageSize ?? ""}${value.aspectRatio ? `, ${value.aspectRatio}` : ""}): ${value.credits ?? "?"} credits${value.canGenerate ? "" : " (cannot generate)"}${value.warnings?.length ? `\nwarnings: ${value.warnings.join("; ")}` : ""}`,
                }];
              },
            },
            async execute(args) {
              const key = requireKey(await resolveKeyAsync(ctx, current()));
              const cfg = current();
              const payload = await buildPayload(args, cfg);
              const data = await callApi(key, "POST", EP_ESTIMATE, payload, 30000);
              const out: Record<string, unknown> = {
                ok: true,
                model: payload.model,
                imageSize: payload.imageConfig.imageSize,
                aspectRatio: payload.imageConfig.aspectRatio ?? "",
              };
              if (typeof data?.credits === "number") out.credits = data.credits;
              if (typeof data?.canGenerate === "boolean") out.canGenerate = data.canGenerate;
              if (typeof data?.requiresSubscription === "boolean") out.requiresSubscription = data.requiresSubscription;
              if (Array.isArray(data?.warnings) && data.warnings.length > 0) out.warnings = data.warnings.map(String);
              return out;
            },
          })
        )
      );

      disposers.push(
        sctx.tools.register(
          defineTool({
            name: "labnana_get_subscription",
            description:
              "Get the Labnana account subscription: available credits (monthly / permanent / limited-time), free usage (FREE_USAGE) balances per model, plan name and expiry. Use before generating to confirm the account can afford it.",
            parameters: {},
            output: {
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  ok: { type: "boolean" },
                  totalAvailableCredits: { type: "number" },
                  monthlyAvailable: { type: "number" },
                  monthlyTotal: { type: "number" },
                  permanentAvailable: { type: "number" },
                  limitedTimeAvailable: { type: "number" },
                  paidStatus: { type: "boolean" },
                  renewStatus: { type: "boolean" },
                  plan: { type: "string" },
                  planDuration: { type: "string" },
                  subscriptionExpiresAt: { type: "number" },
                  freeUsages: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        resourceKey: { type: "string" },
                        remaining: { type: "number" },
                        unlimited: { type: "boolean" },
                        unit: { type: "string" },
                      },
                    },
                  },
                },
              },
              render(args, value) {
                const free = (value.freeUsages ?? []).map((f) => `${f.resourceKey}: ${f.unlimited ? "unlimited" : f.remaining}`).join(", ") || "none";
                const exp = value.subscriptionExpiresAt ? new Date(value.subscriptionExpiresAt).toISOString().slice(0, 10) : "";
                return [{
                  type: "text",
                  text: `Labnana subscription:\n- credits: ${value.totalAvailableCredits ?? 0} total (monthly ${value.monthlyAvailable ?? 0}/${value.monthlyTotal ?? 0}, permanent ${value.permanentAvailable ?? 0}, limited-time ${value.limitedTimeAvailable ?? 0})\n- plan: ${value.plan ?? "free"}${value.planDuration ? ` (${value.planDuration})` : ""}${exp ? `, expires ${exp}` : ""}\n- paid: ${value.paidStatus ? "yes" : "no"}, renew: ${value.renewStatus ? "on" : "off"}\n- free usages: ${free}`,
                }];
              },
            },
            async execute() {
              const key = requireKey(await resolveKeyAsync(ctx, current()));
              const summary = await subscriptionSummary(key);
              return { ok: true, ...summary };
            },
          })
        )
      );

      disposers.push(
        sctx.tools.register(
          defineTool({
            name: "labnana_get_task",
            description:
              "Query a Labnana async generation task by taskId (created by labnana_generate_image in async/4K mode, or after a timeout). Returns status (pending/generating/success/fail), public image URLs and failure message.",
            parameters: {
              taskId: { type: "string", required: true, description: "The task id to query." },
            },
            output: {
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  ok: { type: "boolean" },
                  taskId: { type: "string" },
                  status: { type: "string" },
                  failMsg: { type: "string" },
                  images: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        url: { type: "string" },
                        mimeType: { type: "string" },
                      },
                    },
                  },
                },
              },
              render(args, value) {
                const lines = (value.images ?? []).map((img) => `- ${img.url} (${img.mimeType ?? ""})`);
                return [{
                  type: "text",
                  text: `Labnana task ${value.taskId ?? args.taskId}: ${value.status ?? "unknown"}${value.failMsg ? `\nfailMsg: ${value.failMsg}` : ""}\n${lines.join("\n")}`,
                }];
              },
            },
            async execute(args) {
              const key = requireKey(await resolveKeyAsync(ctx, current()));
              const taskId = String(args.taskId ?? "");
              if (!taskId) throw new Error("labnana: taskId is required");
              const data = await callApi(key, "GET", `${EP_TASKS}/${taskId}`, null, 30000);
              const out: Record<string, unknown> = { ok: true, taskId, status: data?.status ?? "unknown" };
              if (typeof data?.failMsg === "string" && data.failMsg.length > 0) out.failMsg = data.failMsg;
              if (Array.isArray(data?.images)) {
                out.images = data.images.map((img: any) => {
                  const item: Record<string, unknown> = {};
                  if (img?.url) item.url = img.url;
                  if (img?.mimeType) item.mimeType = img.mimeType;
                  return item;
                });
              }
              return out;
            },
          })
        )
      );

      return () => {
        for (const dispose of disposers) dispose();
      };
    }, "dsh-labnana: tools");
  });
  //#endregion

  //#region HTTP 端点（测试连接 + 图片服务 + 手动保存）
  const guard = (req: any, res: any): boolean => {
    const address = req.socket.remoteAddress;
    if (address !== "127.0.0.1" && address !== "::1" && address !== "::ffff:127.0.0.1") {
      writeJson(res, 403, { error: "loopback requests only" });
      return false;
    }
    const host = req.headers.host;
    if (typeof host !== "string" || (!host.startsWith("127.0.0.1") && !host.startsWith("localhost") && !host.startsWith("[::1]"))) {
      writeJson(res, 403, { error: "loopback requests only" });
      return false;
    }
    if (req.method !== "POST") {
      writeJson(res, 405, { error: "method not allowed: " + (req.method ?? "") });
      return false;
    }
    return true;
  };

  const writeJson = (res: any, status: number, body: unknown) => {
    const payload = JSON.stringify(body);
    res.writeHead(status, { "content-type": "application/json; charset=utf-8", "referrer-policy": "no-referrer" });
    res.end(payload);
  };

  const readJsonBody = async (req: any): Promise<Record<string, unknown> | undefined> => {
    const chunks: Buffer[] = [];
    let size = 0;
    try {
      for await (const chunk of req) {
        chunks.push(chunk);
        size += chunk.length;
        if (size > 64 * 1024) return undefined;
      }
    } catch {
      return undefined;
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return undefined;
    }
  };

  async function testConnection(): Promise<Record<string, unknown>> {
    // 测试 API key：调 subscription 接口，返回余额摘要；keyState 仅含脱敏预览
    const cfg = current();
    const keyState = await keyStateOf(ctx, cfg);
    const key = await resolveKeyAsync(ctx, cfg);
    if (!key) {
      return { ok: false, code: "21007", message: "API key 未配置。请在下方填写或设置 LABNANA_API_KEY 环境变量。", keyState };
    }
    try {
      const summary = await subscriptionSummary(key);
      return { ok: true, value: summary, keyState, version: PLUGIN_VERSION };
    } catch (error: any) {
      return { ok: false, code: error?.code ?? "unknown", message: error?.rawMessage ?? error?.message ?? String(error), keyState };
    }
  }

  async function saveImageToProject(name: unknown): Promise<Record<string, unknown>> {
    // 把未落盘的图片（内存）或临时文件复制到项目目录（用户从对话卡片点击"保存到项目"）
    const clean = path.basename(String(name ?? ""));
    if (!clean || clean === "." || clean === ".." || clean !== String(name ?? "")) {
      return { ok: false, code: "bad-name", message: "bad file name" };
    }
    const workspaceCwd = SAVED_WORKSPACES.get(clean) ?? "";
    const dir = resolveOutputDir(current(), undefined, workspaceCwd);
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, clean);
    // 1) 内存源（未保存模式）
    const mem = IN_MEMORY_IMAGES.get(clean);
    if (mem) {
      fs.writeFileSync(target, Buffer.from(mem.data, "base64"));
      SAVED_IMAGES.set(clean, target);
      return { ok: true, path: target, url: `${IMAGE_PREFIX}/${encodeURIComponent(clean)}` };
    }
    // 2) 磁盘源（历史临时/项目文件）
    const source = SAVED_IMAGES.get(clean) ?? findSavedImage(clean, current(), workspaceImageDirs(ctx));
    if (!source || !fs.existsSync(source)) {
      return { ok: false, code: "not-found", message: "image not found (进程重启后未保存的图片已失效，请重新生成)" };
    }
    fs.copyFileSync(source, target);
    SAVED_IMAGES.set(clean, target);
    return { ok: true, path: target, url: `${IMAGE_PREFIX}/${encodeURIComponent(clean)}` };
  }

  ctx.inject(["webServer"], (sctx) => {
    const server = sctx as unknown as HttpServerContext;
    server.webServer.register({
      kind: "exact",
      path: `${BRIDGE_PREFIX}/test`,
      handler: async (req: any, res: any) => {
        if (!guard(req, res)) return;
        writeJson(res, 200, await testConnection());
      },
    });
    // 手动保存：把未落盘图片复制到项目 labnana-images/（对话卡片"保存到项目"按钮）
    server.webServer.register({
      kind: "exact",
      path: `${IMAGE_PREFIX}/save`,
      handler: async (req: any, res: any) => {
        if (!guard(req, res)) return;
        const body = await readJsonBody(req);
        if (body === undefined || typeof body?.name !== "string") {
          writeJson(res, 400, { ok: false, code: "bad-request", message: "malformed JSON body" });
          return;
        }
        writeJson(res, 200, await saveImageToProject(body.name));
      },
    });
    // 图片服务：serve labnana 生成图（内存优先，磁盘兜底），供 toolview 卡片 <img> 加载
    server.webServer.register({
      kind: "prefix",
      path: IMAGE_PREFIX,
      handler: async (req: any, res: any) => {
        const address = req.socket.remoteAddress;
        if (address !== "127.0.0.1" && address !== "::1" && address !== "::ffff:127.0.0.1") {
          writeJson(res, 403, { error: "forbidden" });
          return;
        }
        try {
          const url = new URL(req.url ?? "/", "http://x");
          const rest = decodeURIComponent(url.pathname.slice(IMAGE_PREFIX.length + 1));
          const name = path.basename(rest);
          if (!name || name === "." || name === "..") {
            writeJson(res, 400, { error: "bad file" });
            return;
          }
          // 1) 内存驻留图（未保存模式，零落盘）
          const mem = IN_MEMORY_IMAGES.get(name);
          if (mem) {
            res.writeHead(200, { "content-type": mem.mimeType, "cache-control": "max-age=3600" });
            res.end(Buffer.from(mem.data, "base64"));
            return;
          }
          // 2) 磁盘文件（保存过的图 / 历史图）
          const abs = SAVED_IMAGES.get(name) ?? findSavedImage(name, current(), workspaceImageDirs(ctx));
          if (!abs || !fs.existsSync(abs)) {
            writeJson(res, 404, { error: "not found" });
            return;
          }
          const mime = EXT_MIME[path.extname(name).slice(1).toLowerCase()] ?? "application/octet-stream";
          res.writeHead(200, { "content-type": mime, "cache-control": "max-age=3600" });
          fs.createReadStream(abs).pipe(res);
        } catch {
          writeJson(res, 500, { error: "internal" });
        }
      },
    });
    return () => {};
  });
  //#endregion

  //#region 系统提示词
  ctx.inject(["systemPrompt"], (sctx) => {
    let disposeSection: (() => void) | null = null;
    refreshPrompt = () => {
      if (disposeSection) {
        disposeSection();
        disposeSection = null;
      }
      const cfg = current();
      const model = cfg?.defaultModel ?? "gemini-3-pro-image";
      const size = cfg?.defaultImageSize ?? "2K";
      const ratio = cfg?.defaultAspectRatio ?? "1:1";
      const promptService = sctx as unknown as { systemPrompt: SystemPromptSectionService };
      disposeSection = promptService.systemPrompt.section({
        name: "labnana:image-generation",
        order: 600,
        text: [
          "## Labnana image generation (dsh-labnana plugin)",
          "",
          "You can generate images with the Labnana API. Tools:",
          "- `labnana_generate_image` — text-to-image / image-to-image / precise editing. Pass referenceImages for image-to-image (url = remote image, filePath = local file, data = base64). Default output is saved to the current project's labnana-images/ directory and paths are returned; use outputMode=inline for base64.",
          "- `labnana_estimate_credits` — estimate credit cost without generating.",
          "- `labnana_get_subscription` — check credits / free usage before generating.",
          "- `labnana_get_task` — query an async task by taskId (after a 4K/timeout generation).",
          "",
          `Current defaults: model=${model}, imageSize=${size}, aspectRatio=${ratio}.`,
          "",
          "Models and credit costs (1K/2K/4K):",
          "- gemini-3-pro-image (NanoBanana Pro): 15/15/30, up to 14 reference images",
          "- gemini-3.1-flash-image: 10/10/20, up to 14 reference images",
          "- gpt-image-2: 4/6/10, up to 4 reference images",
          "- wan2.7-image-pro: 6/8/12 (4K text-to-image only), up to 9 reference images",
          "- wan2.7-image: 4/6 (no 4K), up to 9 reference images",
          "- seedream-5-0-pro: 6/15 (no 4K), up to 10 reference images; precise editing = put source image in referenceImages and describe the absolute-coordinate region + change in prompt",
          "",
          "Notes:",
          "- Free quota (FREE_USAGE) exists for gemini-3-pro-image at 1K/2K (earned via signup/invite/check-in); free quota is consumed first and costs no credits. 4K always costs credits.",
          "- imageSize: 1K/2K/4K; aspectRatio: 1:1 2:3 3:2 3:4 4:3 9:16 16:9 21:9 1:4 4:1 1:8 8:1 (Wan2.7 only 1:1 16:9 9:16 4:3 3:4; GPT-Image-2 may omit for auto).",
          "- Error codes: 21007 invalid key, 26004 insufficient credits, 29003 invalid parameters, 29998 rate limited (retry after 20-30s).",
          "- Generation is synchronous for 1K/2K; 4K or async=true runs as an async task (polled internally, max waitSeconds). If it times out, use labnana_get_task with the returned taskId.",
          "- The API key is configured in Settings > Plugins > Labnana (stored in the credentials domain).",
          "- By default images are NOT saved to disk (kept in memory only, zero disk writes); the tool result card shows a 'save to project' button. Users can enable 'save to disk' in Settings > Plugins > Labnana to persist every image automatically.",
          "",
          "WORKFLOWS — use these patterns, they map directly to one tool call:",
          "1. Text-to-image: call labnana_generate_image with just a descriptive prompt (model/size/ratio options). Result is displayed in the conversation card; use the card's 'save to project' button to persist it (or enable 'save to disk' in settings). Tell the user the card shows the image.",
          "2. Image-to-image / edit an existing image: the user may give a local file path, a remote URL, or a base64 image. Pass it in referenceImages as { filePath }, { url }, or { data, mimeType }. Then describe the change in prompt. For Seedream precise editing, put the source in referenceImages and write the region (absolute pixel coords from top-left) and the change into prompt.",
          "3. Iterate / style-swap: to make a variation of a just-generated image, reuse the previous result's path (images[].path) as referenceImages and give a new prompt (e.g. 'same subject, cyberpunk style').",
          "4. Batch compare: generate several variants by calling labnana_generate_image multiple times with different prompt styling; each is saved separately.",
          "5. Before generating, if the user cares about cost, call labnana_estimate_credits; to confirm the account has credits, call labnana_get_subscription.",
          "6. When the user attaches an image in chat and wants it edited, check whether you can read its local path first (it may be a temp attachment you cannot access). If you cannot read it, tell the user to provide a real file path or URL instead of guessing.",
        ].join("\n"),
      });
    };
    sctx.effect(() => {
      refreshPrompt?.();
      return () => {
        if (disposeSection) {
          disposeSection();
          disposeSection = null;
        }
      };
    }, "dsh-labnana: system prompt section");
  });
  //#endregion

  logger.info("dsh-labnana loaded (v%s)", PLUGIN_VERSION);
}

export { name, inject, Config, apply, MODELS, ASPECT_RATIOS, IMAGE_SIZES, ERROR_CODES, resolveKeyAsync, subscriptionSummary };
