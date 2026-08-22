// src/host/index.ts
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import { defineTool } from "@deepseek-ai/dsh-tools";
import z from "@deepseek-ai/schemastery";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
var BASE_URL = "https://api.labnana.com";
var EP_GENERATION = "/openapi/v1/images/generation";
var EP_ASYNC = "/openapi/v1/images/generation/async";
var EP_TASKS = "/openapi/v1/images/generation/tasks";
var EP_SUBSCRIPTION = "/openapi/v1/user/subscription";
var EP_ESTIMATE = "/openapi/v1/images/generation/estimate-credits";
var NS = settingsNamespace("labnana");
var BRIDGE_PREFIX = "/api/dsh-labnana-settings";
var IMAGE_PREFIX = "/api/dsh-labnana-images";
var PLUGIN_VERSION = "0.3.0";
var SAVED_IMAGES = /* @__PURE__ */ new Map();
var SAVED_WORKSPACES = /* @__PURE__ */ new Map();
var SAVED_DIRS = /* @__PURE__ */ new Set();
var IN_MEMORY_IMAGES = /* @__PURE__ */ new Map();
var MODELS = {
  "gemini-3-pro-image": { provider: "google", credits: { "1K": 15, "2K": 15, "4K": 30 }, maxRef: 14, sizes: ["1K", "2K", "4K"] },
  "gemini-3.1-flash-image": { provider: "google", credits: { "1K": 10, "2K": 10, "4K": 20 }, maxRef: 14, sizes: ["1K", "2K", "4K"] },
  "gpt-image-2": { provider: "openai", credits: { "1K": 4, "2K": 6, "4K": 10 }, maxRef: 4, sizes: ["1K", "2K", "4K"] },
  "wan2.7-image-pro": { provider: "alibaba", credits: { "1K": 6, "2K": 8, "4K": 12 }, maxRef: 9, sizes: ["1K", "2K", "4K"], refNo4k: true },
  "wan2.7-image": { provider: "alibaba", credits: { "1K": 4, "2K": 6 }, maxRef: 9, sizes: ["1K", "2K"] },
  "seedream-5-0-pro": { provider: "bytedance", credits: { "1K": 6, "2K": 15 }, maxRef: 10, sizes: ["1K", "2K"] }
};
var ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9", "1:4", "4:1", "1:8", "8:1"];
var IMAGE_SIZES = ["1K", "2K", "4K"];
var ERROR_CODES = {
  21007: "API Key \u65E0\u6548\uFF08Invalid API Key\uFF09",
  26004: "\u79EF\u5206\u4E0D\u8DB3\uFF08Insufficient credits\uFF09",
  29003: "\u53C2\u6570\u9519\u8BEF\uFF08Invalid parameters\uFF09",
  29998: "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF08Too many requests\uFF09\uFF0C\u5EFA\u8BAE\u7B49\u5F85 20-30 \u79D2\u540E\u91CD\u8BD5"
};
var MIME_EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
var EXT_MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
async function callApi(key, method, apiPath, body, timeoutMs) {
  const headers = { Authorization: `Bearer ${key}` };
  let init;
  if (method === "GET") {
    init = { method, headers };
  } else {
    headers["Content-Type"] = "application/json";
    init = { method, headers, body: JSON.stringify(body) };
  }
  let response;
  try {
    response = await fetchWithTimeout(`${BASE_URL}${apiPath}`, init, timeoutMs);
  } catch (error) {
    if (error?.name === "AbortError") {
      const err2 = new Error(`labnana: request timed out after ${Math.round(timeoutMs / 1e3)}s`);
      err2.code = "TIMEOUT";
      throw err2;
    }
    const err = new Error(`labnana: network error - ${error?.message ?? String(error)}`);
    err.code = "NETWORK";
    throw err;
  }
  let payload = null;
  try {
    payload = await response.json();
  } catch {
  }
  if (!response.ok || payload && typeof payload.code === "number" && payload.code !== 0) {
    const code = payload?.code ?? "HTTP";
    const message = payload?.message ?? `HTTP ${response.status}`;
    const err = new Error(`labnana: [${code}] ${ERROR_CODES[code] ?? message}`);
    err.code = String(code);
    err.rawMessage = message;
    throw err;
  }
  return payload?.data ?? payload ?? null;
}
async function resolveCredentialValue(ctx, envName) {
  const credentials = ctx.get("credentials");
  if (credentials === void 0) return void 0;
  try {
    const resolved = await credentials.resolve(envName);
    if (resolved && typeof resolved.value === "string" && resolved.value.length > 0) return resolved.value;
  } catch {
  }
  return void 0;
}
async function resolveKey(ctx, config) {
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
async function resolveKeyAsync(ctx, config) {
  return resolveKey(ctx, config);
}
function maskKey(key) {
  if (!key || key.length === 0) return "";
  if (key.length <= 10) return `${key.slice(0, 2)}\u2026${key.slice(-2)}`;
  return `${key.slice(0, 8)}\u2026${key.slice(-4)}`;
}
async function keyStateOf(ctx, config) {
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
  } catch {
  }
  return { configured: false, source: "none", masked: "" };
}
function requireKey(key) {
  if (!key || key.length === 0) {
    const err = new Error(
      "labnana: API key \u672A\u914D\u7F6E\u3002\u8BF7\u5728 \u8BBE\u7F6E \u2192 \u63D2\u4EF6 \u2192 Labnana \u5361\u7247 \u586B\u5199 API Key\uFF08\u5B58\u4E8E\u51ED\u636E\u57DF\uFF09\uFF0C\u6216\u8BBE\u7F6E LABNANA_API_KEY \u73AF\u5883\u53D8\u91CF\uFF08https://labnana.com/api-keys\uFF09"
    );
    err.code = "21007";
    throw err;
  }
  return key;
}
function buildReferenceImage(entry, index) {
  if (entry === null || typeof entry !== "object") {
    return { ok: false, error: `referenceImages[${index}] \u5FC5\u987B\u662F\u5BF9\u8C61 { url | filePath | data+mimeType }` };
  }
  const e = entry;
  if (typeof e.url === "string" && e.url.length > 0) {
    const mime = typeof e.mimeType === "string" ? e.mimeType : "image/png";
    return { ok: true, value: { fileData: { fileUri: e.url, mimeType: mime } } };
  }
  if (typeof e.filePath === "string" && e.filePath.length > 0) {
    try {
      const stat = fs.statSync(e.filePath);
      if (stat.size > 15 * 1024 * 1024) {
        return { ok: false, error: `referenceImages[${index}] \u672C\u5730\u6587\u4EF6\u8D85\u8FC7 15MB\uFF08${e.filePath}\uFF09\uFF0C\u8BF7\u5148\u4E0A\u4F20\u6216\u4F7F\u7528 URL` };
      }
      const data = fs.readFileSync(e.filePath).toString("base64");
      const ext = path.extname(e.filePath).slice(1).toLowerCase();
      const mime = EXT_MIME[ext] ?? (typeof e.mimeType === "string" ? e.mimeType : "image/png");
      return { ok: true, value: { inlineData: { data, mimeType: mime } } };
    } catch (error) {
      return { ok: false, error: `referenceImages[${index}] \u8BFB\u53D6\u672C\u5730\u6587\u4EF6\u5931\u8D25: ${error?.message ?? String(error)}` };
    }
  }
  if (typeof e.data === "string" && e.data.length > 0) {
    return { ok: true, value: { inlineData: { data: e.data, mimeType: typeof e.mimeType === "string" ? e.mimeType : "image/png" } } };
  }
  return { ok: false, error: `referenceImages[${index}] \u9700\u63D0\u4F9B url / filePath / data \u4E4B\u4E00` };
}
function resolveOutputDir(config, saveDir, workspaceCwd) {
  if (saveDir && saveDir.length > 0) return path.resolve(saveDir);
  if (config?.outputDir && config.outputDir.length > 0) return path.resolve(config.outputDir);
  const base = workspaceCwd && workspaceCwd.length > 0 ? workspaceCwd : process.cwd();
  return path.join(base, "labnana-images");
}
function timestampName(ext) {
  const d = /* @__PURE__ */ new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `labnana-${stamp}-${crypto.randomBytes(3).toString("hex")}.${ext}`;
}
function saveBase64Image(dir, data, mimeType) {
  const ext = MIME_EXT[mimeType] ?? "png";
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, timestampName(ext));
  const buffer = Buffer.from(data, "base64");
  fs.writeFileSync(file, buffer);
  return { path: file, mimeType, size: buffer.length };
}
async function downloadImage(dir, url, mimeType, timeoutMs) {
  const response = await fetchWithTimeout(url, {}, timeoutMs);
  if (!response.ok) throw new Error(`labnana: \u4E0B\u8F7D\u751F\u6210\u56FE\u7247\u5931\u8D25 HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = MIME_EXT[mimeType] ?? "png";
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, timestampName(ext));
  fs.writeFileSync(file, buffer);
  return { path: file, mimeType, size: buffer.length };
}
function findSavedImage(name2, cfg = {}, extraDirs = []) {
  const dirs = [];
  if (typeof cfg.outputDir === "string" && cfg.outputDir.length > 0) dirs.push(cfg.outputDir);
  dirs.push(path.join(process.cwd(), "labnana-images"));
  for (const dir of SAVED_DIRS) dirs.push(dir);
  for (const dir of extraDirs) dirs.push(dir);
  const seen = /* @__PURE__ */ new Set();
  for (const dir of dirs) {
    const abs = path.resolve(dir);
    if (seen.has(abs)) continue;
    seen.add(abs);
    try {
      const candidate = path.join(abs, name2);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    } catch {
    }
  }
  return void 0;
}
function workspaceImageDirs(ctx) {
  const dirs = [];
  try {
    const registry = ctx.get("workspaceRegistry");
    if (registry && typeof registry.list === "function") {
      for (const ws of registry.list()) {
        if (ws && typeof ws.path === "string" && ws.path.length > 0) dirs.push(path.join(ws.path, "labnana-images"));
      }
    }
  } catch {
  }
  return dirs;
}
function extractInlineImage(payload) {
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
async function pollTask(key, taskId, waitSeconds, timeoutMs) {
  const deadline = Date.now() + waitSeconds * 1e3;
  let last = null;
  while (Date.now() < deadline) {
    const data = await callApi(key, "GET", `${EP_TASKS}/${taskId}`, null, timeoutMs);
    last = data;
    if (data?.status === "success" || data?.status === "fail") return data;
    await sleep(3e3);
  }
  const err = new Error(
    `labnana: \u5F02\u6B65\u4EFB\u52A1 ${taskId} \u5728 ${waitSeconds}s \u5185\u672A\u5B8C\u6210\uFF08\u5F53\u524D\u72B6\u6001: ${last?.status ?? "unknown"}\uFF09\u3002\u53EF\u7528 labnana_get_task \u5DE5\u5177\u7EE7\u7EED\u67E5\u8BE2 taskId=${taskId}`
  );
  err.code = "TASK_TIMEOUT";
  err.taskId = taskId;
  throw err;
}
function buildPayload(args, cfg) {
  const model = args.model ?? cfg?.defaultModel ?? "gemini-3-pro-image";
  const meta = MODELS[model];
  if (!meta) {
    throw new Error(`labnana: \u672A\u77E5\u6A21\u578B "${model}"\uFF0C\u53EF\u9009: ${Object.keys(MODELS).join(" / ")}`);
  }
  const imageSize = args.imageSize ?? cfg?.defaultImageSize ?? "2K";
  if (!meta.sizes.includes(imageSize)) {
    throw new Error(`labnana: \u6A21\u578B ${model} \u4E0D\u652F\u6301 ${imageSize}\uFF0C\u4EC5\u652F\u6301 ${meta.sizes.join(" / ")}`);
  }
  const aspectRatio = args.aspectRatio ?? cfg?.defaultAspectRatio ?? "1:1";
  const payload = {
    provider: meta.provider,
    model,
    prompt: String(args.prompt ?? ""),
    imageConfig: { imageSize }
  };
  if (aspectRatio && aspectRatio !== "auto") payload.imageConfig.aspectRatio = aspectRatio;
  const refs = Array.isArray(args.referenceImages) ? args.referenceImages : [];
  if (refs.length > 0) {
    if (refs.length > meta.maxRef) {
      throw new Error(`labnana: \u6A21\u578B ${model} \u6700\u591A\u652F\u6301 ${meta.maxRef} \u5F20\u53C2\u8003\u56FE\uFF0C\u6536\u5230 ${refs.length} \u5F20`);
    }
    const built = [];
    for (let i = 0; i < refs.length; i++) {
      const r = buildReferenceImage(refs[i], i);
      if (!r.ok) throw new Error(r.error);
      built.push(r.value);
    }
    payload.referenceImages = built;
    if (imageSize === "4K" && meta.refNo4k) {
      throw new Error(`labnana: wan2.7-image-pro \u5E26\u53C2\u8003\u56FE\u65F6\u4E0D\u652F\u6301 4K\uFF0C\u8BF7\u4F7F\u7528 1K/2K`);
    }
  }
  return payload;
}
async function subscriptionSummary(key) {
  const data = await callApi(key, "GET", EP_SUBSCRIPTION, null, 2e4);
  if (!data) return {};
  const free = [];
  const freeUsages = data.freeUsages ?? {};
  for (const [k, v] of Object.entries(freeUsages)) {
    if (v && typeof v === "object" && v.remaining !== void 0) {
      free.push({
        resourceKey: v.resourceKey ?? k,
        remaining: v.remaining,
        unlimited: v.unlimited === true,
        unit: v.unit ?? "generation"
      });
    }
  }
  const out = {
    totalAvailableCredits: data.totalAvailableCredits ?? 0,
    monthlyAvailable: data.usageAvailableMonthlyCredits ?? 0,
    monthlyTotal: data.usageTotalMonthlyCredits ?? 0,
    permanentAvailable: data.usageAvailablePermanentCredits ?? 0,
    limitedTimeAvailable: data.usageAvailableLimitedTimeCredits ?? 0,
    renewStatus: data.renewStatus === true,
    paidStatus: data.paidStatus === true,
    freeUsages: free
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
var name = "dsh-labnana";
var inject = [];
var Config = z.object({
  // 官方模式：settings 只携带对机密的引用（环境变量名），值存 credentials 域
  apiKeyEnv: z.string().default(""),
  // 默认不保存图片到磁盘；勾选后每次生成自动保存到项目 labnana-images/
  saveToDisk: z.boolean().default(false),
  defaultModel: z.string().default("gemini-3-pro-image"),
  defaultImageSize: z.string().default("2K"),
  defaultAspectRatio: z.string().default("1:1"),
  outputDir: z.string().default(""),
  timeoutSeconds: z.number().default(120)
});
function apply(ctx, config) {
  let current = () => config ?? {};
  const logger = ctx.logger;
  let refreshPrompt = null;
  installSettingsSection(ctx, NS, Config, config ?? {}, {
    setSource: (source) => {
      current = source;
    },
    onChange: () => {
      if (typeof refreshPrompt === "function") refreshPrompt();
    }
  });
  async function generateImage(args, cfg, key, workspaceCwd) {
    const payload = await buildPayload(args, cfg);
    const model = payload.model;
    const imageSize = payload.imageConfig.imageSize;
    const waitSeconds = Math.min(Math.max(Number(args.waitSeconds ?? 180) || 180, 10), 600);
    const timeoutMs = Math.min(Math.max(Number(cfg.timeoutSeconds ?? 120) || 120, 15), 300) * 1e3;
    const outputMode = args.outputMode === "inline" ? "inline" : "file";
    const persist = Boolean(args.saveDir && args.saveDir.length > 0) || cfg.saveToDisk === true;
    const dir = persist ? resolveOutputDir(cfg, args.saveDir, workspaceCwd) : "";
    try {
      if (dir) SAVED_DIRS.add(path.resolve(dir));
    } catch {
    }
    const useAsync = args.async === true || imageSize === "4K";
    let result;
    let taskId = null;
    if (useAsync) {
      const created = await callApi(key, "POST", EP_ASYNC, payload, timeoutMs);
      taskId = created?.taskId;
      if (!taskId) throw new Error("labnana: \u5F02\u6B65\u4EFB\u52A1\u521B\u5EFA\u5931\u8D25\uFF08\u672A\u8FD4\u56DE taskId\uFF09");
      const done = await pollTask(key, taskId, waitSeconds, timeoutMs);
      if (done?.status !== "success") {
        throw new Error(`labnana: \u5F02\u6B65\u4EFB\u52A1\u5931\u8D25\uFF08${done?.status}\uFF09${done?.failMsg ? `: ${done.failMsg}` : ""}`);
      }
      const images = Array.isArray(done.images) ? done.images : [];
      if (images.length === 0) throw new Error("labnana: \u4EFB\u52A1\u6210\u529F\u4F46\u672A\u8FD4\u56DE\u56FE\u7247");
      if (outputMode === "inline") {
        const first = images[0];
        const response = await fetchWithTimeout(first.url, {}, timeoutMs);
        if (!response.ok) throw new Error(`labnana: \u4E0B\u8F7D\u56FE\u7247\u5931\u8D25 HTTP ${response.status}`);
        const buf = Buffer.from(await response.arrayBuffer());
        result = {
          images: [{ data: buf.toString("base64"), mimeType: first.mimeType ?? "image/png", size: buf.length }]
        };
      } else if (persist) {
        const saved = [];
        for (const img of images) {
          const s = await downloadImage(dir, img.url, img.mimeType ?? "image/png", timeoutMs);
          saved.push({ ...s });
        }
        result = { images: saved };
      } else {
        const saved = [];
        for (const img of images) {
          const response = await fetchWithTimeout(img.url, {}, timeoutMs);
          if (!response.ok) throw new Error(`labnana: \u4E0B\u8F7D\u56FE\u7247\u5931\u8D25 HTTP ${response.status}`);
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
        throw new Error("labnana: \u54CD\u5E94\u4E2D\u672A\u627E\u5230\u56FE\u7247\u6570\u636E\uFF08\u8BF7\u68C0\u67E5 prompt \u4E0E\u6A21\u578B\u9650\u5236\uFF09");
      }
      if (outputMode === "inline") {
        result = { images: [{ data: image.data, mimeType: image.mimeType, size: Math.floor(image.data.length * 0.75) }] };
      } else if (persist) {
        const saved = saveBase64Image(dir, image.data, image.mimeType);
        result = { images: [{ ...saved }] };
      } else {
        const n = timestampName(MIME_EXT[image.mimeType] ?? "png");
        IN_MEMORY_IMAGES.set(n, { data: image.data, mimeType: image.mimeType, size: Math.floor(image.data.length * 0.75) });
        result = { images: [{ name: n, mimeType: image.mimeType, size: Math.floor(image.data.length * 0.75) }] };
      }
    }
    const out = {
      ok: true,
      model,
      imageSize,
      aspectRatio: payload.imageConfig.aspectRatio ?? "",
      images: result.images.map((img) => {
        const item = { mimeType: img.mimeType };
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
      })
    };
    if (taskId) out.taskId = taskId;
    if (outputMode === "inline") {
      out.message = "inline \u6A21\u5F0F\uFF1A\u56FE\u7247\u4EE5 base64 \u8FD4\u56DE\uFF08data \u5B57\u6BB5\uFF09";
    } else {
      out.saved = persist;
      if (persist) {
        out.message = `\u56FE\u7247\u5DF2\u4FDD\u5B58\u5230 ${result.images.length} \u4E2A\u6587\u4EF6\uFF08${dir}\uFF09`;
      } else {
        out.message = `\u56FE\u7247\u5DF2\u751F\u6210\uFF08${result.images.length} \u5F20\uFF0C\u9A7B\u7559\u5185\u5B58\u672A\u843D\u76D8\uFF1B\u5BF9\u8BDD\u5361\u7247\u53EF\u70B9\u51FB"\u4FDD\u5B58\u5230\u9879\u76EE"\uFF09`;
      }
    }
    return out;
  }
  function sessionCwdOf(exec) {
    const agent = exec.agent;
    return agent?.session?.header?.cwd ?? "";
  }
  ctx.inject(["tools"], (sctx) => {
    sctx.effect(() => {
      const disposers = [];
      disposers.push(
        sctx.tools.register(
          defineTool({
            name: "labnana_generate_image",
            description: "Generate an image via the Labnana API (text-to-image / image-to-image / precise editing). Supports models: gemini-3-pro-image (NanoBanana Pro), gemini-3.1-flash-image, gpt-image-2, wan2.7-image-pro, wan2.7-image, seedream-5-0-pro. Pass referenceImages for image-to-image or editing (url = remote image, filePath = local file, data = base64). 4K and async=true run as async tasks with internal polling. By default the image is NOT saved to disk (kept in memory only; the conversation card offers a 'save to project' button) unless the user enabled 'save to disk' in settings or you pass saveDir. Returns { ok, saved, images: [{url, path?, mimeType, size}], model, imageSize, aspectRatio, taskId? }.",
            parameters: {
              prompt: { type: "string", required: true, description: "Image generation prompt (Chinese or English). For Seedream precise editing, describe the region (absolute pixel coords from top-left) and the change." },
              model: { type: "string", description: "Model id (default: gemini-3-pro-image). gemini-3-pro-image / gemini-3.1-flash-image / gpt-image-2 / wan2.7-image-pro / wan2.7-image / seedream-5-0-pro" },
              imageSize: { type: "string", description: "1K | 2K | 4K (default 2K; wan2.7-image and seedream-5-0-pro do not support 4K)" },
              aspectRatio: { type: "string", description: "One of 1:1 2:3 3:2 3:4 4:3 9:16 16:9 21:9 1:4 4:1 1:8 8:1, or 'auto' to let the model choose (default 1:1)" },
              referenceImages: {
                type: "array",
                description: "Optional reference images for image-to-image / editing. Each item: { url } (remote https/gs URL + optional mimeType), { filePath } (local file), or { data, mimeType } (base64). Limits: Gemini 14, GPT-Image-2 4, Wan2.7 9, Seedream 10.",
                items: { type: "json" }
              },
              outputMode: { type: "string", description: "'file' (default) saves to disk; 'inline' returns base64 data." },
              saveDir: { type: "string", description: "Optional directory to save images (default: <config outputDir> or <workspace>/labnana-images)." },
              async: { type: "boolean", description: "Force async task mode (4K already runs async automatically)." },
              waitSeconds: { type: "number", description: "Max wait for async tasks in seconds (default 180, range 10-600)." }
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
                        size: { type: "number" }
                      }
                    }
                  }
                }
              },
              render(args, value) {
                const lines = (value.images ?? []).map((img, i) => {
                  const where = img.path ? `path=${img.path}` : img.data ? `base64 (${Math.floor((img.data?.length ?? 0) / 1024)}KB)` : "";
                  return `- image[${i}]: ${img.mimeType ?? ""}${where ? ` ${where}` : ""}`;
                });
                return [{
                  type: "text",
                  text: `Labnana generate (${value.model ?? ""}, ${value.imageSize ?? ""}${value.aspectRatio ? `, ${value.aspectRatio}` : ""}):
${lines.join("\n") || "no images"}${value.taskId ? `
taskId=${value.taskId}` : ""}`
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
                    ...typeof img?.url === "string" ? { url: img.url } : {},
                    ...typeof img?.path === "string" ? { path: img.path } : {},
                    ...typeof img?.mimeType === "string" ? { mimeType: img.mimeType } : {},
                    ...typeof img?.size === "number" ? { size: img.size } : {}
                  }))
                };
              }
            },
            presentCall(args) {
              return {
                card: "generic",
                title: `\u751F\u6210\u56FE\u7247 \xB7 ${args.model ?? "gemini-3-pro-image"} ${args.imageSize ?? "2K"}`,
                rawInput: typeof args.prompt === "string" ? args.prompt : ""
              };
            },
            presentResult(args, result) {
              if (result.isError) {
                return { card: "generic", title: `\u751F\u6210\u56FE\u7247\u5931\u8D25 \xB7 ${result.content?.[0]?.text ?? ""}`, kind: "generic" };
              }
              const value = result.meta ?? {};
              const images = Array.isArray(value.images) ? value.images : [];
              return {
                card: "generic",
                title: `\u5DF2\u751F\u6210 ${images.length} \u5F20 \xB7 ${value.model ?? ""} ${value.imageSize ?? ""}${value.aspectRatio ? ` ${value.aspectRatio}` : ""}`,
                kind: "generic",
                content: images.map((img) => img.path ?? img.url ?? "").filter(Boolean).join("\n"),
                locations: images.map((img) => img.path ? { path: img.path } : void 0).filter(Boolean)
              };
            },
            async execute(args, exec) {
              const key = requireKey(await resolveKeyAsync(ctx, current()));
              return await generateImage(args, current(), key, sessionCwdOf(exec));
            }
          })
        )
      );
      disposers.push(
        sctx.tools.register(
          defineTool({
            name: "labnana_estimate_credits",
            description: "Estimate how many Labnana credits a generation would cost WITHOUT generating the image or spending credits. Returns credits, canGenerate, requiresSubscription, pricing and warnings.",
            parameters: {
              prompt: { type: "string", required: true, description: "The prompt you plan to use (length can affect pricing)." },
              model: { type: "string", description: "Model id (default: gemini-3-pro-image)." },
              imageSize: { type: "string", description: "1K | 2K | 4K (default 2K)." },
              aspectRatio: { type: "string", description: "Aspect ratio (default 1:1)." }
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
                  warnings: { type: "array", items: { type: "string" } }
                }
              },
              render(args, value) {
                return [{
                  type: "text",
                  text: `Labnana estimate (${value.model ?? ""}, ${value.imageSize ?? ""}${value.aspectRatio ? `, ${value.aspectRatio}` : ""}): ${value.credits ?? "?"} credits${value.canGenerate ? "" : " (cannot generate)"}${value.warnings?.length ? `
warnings: ${value.warnings.join("; ")}` : ""}`
                }];
              }
            },
            async execute(args) {
              const key = requireKey(await resolveKeyAsync(ctx, current()));
              const cfg = current();
              const payload = await buildPayload(args, cfg);
              const data = await callApi(key, "POST", EP_ESTIMATE, payload, 3e4);
              const out = {
                ok: true,
                model: payload.model,
                imageSize: payload.imageConfig.imageSize,
                aspectRatio: payload.imageConfig.aspectRatio ?? ""
              };
              if (typeof data?.credits === "number") out.credits = data.credits;
              if (typeof data?.canGenerate === "boolean") out.canGenerate = data.canGenerate;
              if (typeof data?.requiresSubscription === "boolean") out.requiresSubscription = data.requiresSubscription;
              if (Array.isArray(data?.warnings) && data.warnings.length > 0) out.warnings = data.warnings.map(String);
              return out;
            }
          })
        )
      );
      disposers.push(
        sctx.tools.register(
          defineTool({
            name: "labnana_get_subscription",
            description: "Get the Labnana account subscription: available credits (monthly / permanent / limited-time), free usage (FREE_USAGE) balances per model, plan name and expiry. Use before generating to confirm the account can afford it.",
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
                        unit: { type: "string" }
                      }
                    }
                  }
                }
              },
              render(args, value) {
                const free = (value.freeUsages ?? []).map((f) => `${f.resourceKey}: ${f.unlimited ? "unlimited" : f.remaining}`).join(", ") || "none";
                const exp = value.subscriptionExpiresAt ? new Date(value.subscriptionExpiresAt).toISOString().slice(0, 10) : "";
                return [{
                  type: "text",
                  text: `Labnana subscription:
- credits: ${value.totalAvailableCredits ?? 0} total (monthly ${value.monthlyAvailable ?? 0}/${value.monthlyTotal ?? 0}, permanent ${value.permanentAvailable ?? 0}, limited-time ${value.limitedTimeAvailable ?? 0})
- plan: ${value.plan ?? "free"}${value.planDuration ? ` (${value.planDuration})` : ""}${exp ? `, expires ${exp}` : ""}
- paid: ${value.paidStatus ? "yes" : "no"}, renew: ${value.renewStatus ? "on" : "off"}
- free usages: ${free}`
                }];
              }
            },
            async execute() {
              const key = requireKey(await resolveKeyAsync(ctx, current()));
              const summary = await subscriptionSummary(key);
              return { ok: true, ...summary };
            }
          })
        )
      );
      disposers.push(
        sctx.tools.register(
          defineTool({
            name: "labnana_get_task",
            description: "Query a Labnana async generation task by taskId (created by labnana_generate_image in async/4K mode, or after a timeout). Returns status (pending/generating/success/fail), public image URLs and failure message.",
            parameters: {
              taskId: { type: "string", required: true, description: "The task id to query." }
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
                        mimeType: { type: "string" }
                      }
                    }
                  }
                }
              },
              render(args, value) {
                const lines = (value.images ?? []).map((img) => `- ${img.url} (${img.mimeType ?? ""})`);
                return [{
                  type: "text",
                  text: `Labnana task ${value.taskId ?? args.taskId}: ${value.status ?? "unknown"}${value.failMsg ? `
failMsg: ${value.failMsg}` : ""}
${lines.join("\n")}`
                }];
              }
            },
            async execute(args) {
              const key = requireKey(await resolveKeyAsync(ctx, current()));
              const taskId = String(args.taskId ?? "");
              if (!taskId) throw new Error("labnana: taskId is required");
              const data = await callApi(key, "GET", `${EP_TASKS}/${taskId}`, null, 3e4);
              const out = { ok: true, taskId, status: data?.status ?? "unknown" };
              if (typeof data?.failMsg === "string" && data.failMsg.length > 0) out.failMsg = data.failMsg;
              if (Array.isArray(data?.images)) {
                out.images = data.images.map((img) => {
                  const item = {};
                  if (img?.url) item.url = img.url;
                  if (img?.mimeType) item.mimeType = img.mimeType;
                  return item;
                });
              }
              return out;
            }
          })
        )
      );
      return () => {
        for (const dispose of disposers) dispose();
      };
    }, "dsh-labnana: tools");
  });
  const guard = (req, res) => {
    const address = req.socket.remoteAddress;
    if (address !== "127.0.0.1" && address !== "::1" && address !== "::ffff:127.0.0.1") {
      writeJson(res, 403, { error: "loopback requests only" });
      return false;
    }
    const host = req.headers.host;
    if (typeof host !== "string" || !host.startsWith("127.0.0.1") && !host.startsWith("localhost") && !host.startsWith("[::1]")) {
      writeJson(res, 403, { error: "loopback requests only" });
      return false;
    }
    if (req.method !== "POST") {
      writeJson(res, 405, { error: "method not allowed: " + (req.method ?? "") });
      return false;
    }
    return true;
  };
  const writeJson = (res, status, body) => {
    const payload = JSON.stringify(body);
    res.writeHead(status, { "content-type": "application/json; charset=utf-8", "referrer-policy": "no-referrer" });
    res.end(payload);
  };
  const readJsonBody = async (req) => {
    const chunks = [];
    let size = 0;
    try {
      for await (const chunk of req) {
        chunks.push(chunk);
        size += chunk.length;
        if (size > 64 * 1024) return void 0;
      }
    } catch {
      return void 0;
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return void 0;
    }
  };
  async function testConnection() {
    const cfg = current();
    const keyState = await keyStateOf(ctx, cfg);
    const key = await resolveKeyAsync(ctx, cfg);
    if (!key) {
      return { ok: false, code: "21007", message: "API key \u672A\u914D\u7F6E\u3002\u8BF7\u5728\u4E0B\u65B9\u586B\u5199\u6216\u8BBE\u7F6E LABNANA_API_KEY \u73AF\u5883\u53D8\u91CF\u3002", keyState };
    }
    try {
      const summary = await subscriptionSummary(key);
      return { ok: true, value: summary, keyState, version: PLUGIN_VERSION };
    } catch (error) {
      return { ok: false, code: error?.code ?? "unknown", message: error?.rawMessage ?? error?.message ?? String(error), keyState };
    }
  }
  async function saveImageToProject(name2) {
    const clean = path.basename(String(name2 ?? ""));
    if (!clean || clean === "." || clean === ".." || clean !== String(name2 ?? "")) {
      return { ok: false, code: "bad-name", message: "bad file name" };
    }
    const workspaceCwd = SAVED_WORKSPACES.get(clean) ?? "";
    const dir = resolveOutputDir(current(), void 0, workspaceCwd);
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, clean);
    const mem = IN_MEMORY_IMAGES.get(clean);
    if (mem) {
      fs.writeFileSync(target, Buffer.from(mem.data, "base64"));
      SAVED_IMAGES.set(clean, target);
      return { ok: true, path: target, url: `${IMAGE_PREFIX}/${encodeURIComponent(clean)}` };
    }
    const source = SAVED_IMAGES.get(clean) ?? findSavedImage(clean, current(), workspaceImageDirs(ctx));
    if (!source || !fs.existsSync(source)) {
      return { ok: false, code: "not-found", message: "image not found (\u8FDB\u7A0B\u91CD\u542F\u540E\u672A\u4FDD\u5B58\u7684\u56FE\u7247\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u751F\u6210)" };
    }
    fs.copyFileSync(source, target);
    SAVED_IMAGES.set(clean, target);
    return { ok: true, path: target, url: `${IMAGE_PREFIX}/${encodeURIComponent(clean)}` };
  }
  ctx.inject(["webServer"], (sctx) => {
    const server = sctx;
    server.webServer.register({
      kind: "exact",
      path: `${BRIDGE_PREFIX}/test`,
      handler: async (req, res) => {
        if (!guard(req, res)) return;
        writeJson(res, 200, await testConnection());
      }
    });
    server.webServer.register({
      kind: "exact",
      path: `${IMAGE_PREFIX}/save`,
      handler: async (req, res) => {
        if (!guard(req, res)) return;
        const body = await readJsonBody(req);
        if (body === void 0 || typeof body?.name !== "string") {
          writeJson(res, 400, { ok: false, code: "bad-request", message: "malformed JSON body" });
          return;
        }
        writeJson(res, 200, await saveImageToProject(body.name));
      }
    });
    server.webServer.register({
      kind: "prefix",
      path: IMAGE_PREFIX,
      handler: async (req, res) => {
        const address = req.socket.remoteAddress;
        if (address !== "127.0.0.1" && address !== "::1" && address !== "::ffff:127.0.0.1") {
          writeJson(res, 403, { error: "forbidden" });
          return;
        }
        try {
          const url = new URL(req.url ?? "/", "http://x");
          const rest = decodeURIComponent(url.pathname.slice(IMAGE_PREFIX.length + 1));
          const name2 = path.basename(rest);
          if (!name2 || name2 === "." || name2 === "..") {
            writeJson(res, 400, { error: "bad file" });
            return;
          }
          const mem = IN_MEMORY_IMAGES.get(name2);
          if (mem) {
            res.writeHead(200, { "content-type": mem.mimeType, "cache-control": "max-age=3600" });
            res.end(Buffer.from(mem.data, "base64"));
            return;
          }
          const abs = SAVED_IMAGES.get(name2) ?? findSavedImage(name2, current(), workspaceImageDirs(ctx));
          if (!abs || !fs.existsSync(abs)) {
            writeJson(res, 404, { error: "not found" });
            return;
          }
          const mime = EXT_MIME[path.extname(name2).slice(1).toLowerCase()] ?? "application/octet-stream";
          res.writeHead(200, { "content-type": mime, "cache-control": "max-age=3600" });
          fs.createReadStream(abs).pipe(res);
        } catch {
          writeJson(res, 500, { error: "internal" });
        }
      }
    });
    return () => {
    };
  });
  ctx.inject(["systemPrompt"], (sctx) => {
    let disposeSection = null;
    refreshPrompt = () => {
      if (disposeSection) {
        disposeSection();
        disposeSection = null;
      }
      const cfg = current();
      const model = cfg?.defaultModel ?? "gemini-3-pro-image";
      const size = cfg?.defaultImageSize ?? "2K";
      const ratio = cfg?.defaultAspectRatio ?? "1:1";
      const promptService = sctx;
      disposeSection = promptService.systemPrompt.section({
        name: "labnana:image-generation",
        order: 600,
        text: [
          "## Labnana image generation (dsh-labnana plugin)",
          "",
          "You can generate images with the Labnana API. Tools:",
          "- `labnana_generate_image` \u2014 text-to-image / image-to-image / precise editing. Pass referenceImages for image-to-image (url = remote image, filePath = local file, data = base64). Default output is saved to the current project's labnana-images/ directory and paths are returned; use outputMode=inline for base64.",
          "- `labnana_estimate_credits` \u2014 estimate credit cost without generating.",
          "- `labnana_get_subscription` \u2014 check credits / free usage before generating.",
          "- `labnana_get_task` \u2014 query an async task by taskId (after a 4K/timeout generation).",
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
          "WORKFLOWS \u2014 use these patterns, they map directly to one tool call:",
          "1. Text-to-image: call labnana_generate_image with just a descriptive prompt (model/size/ratio options). Result is displayed in the conversation card; use the card's 'save to project' button to persist it (or enable 'save to disk' in settings). Tell the user the card shows the image.",
          "2. Image-to-image / edit an existing image: the user may give a local file path, a remote URL, or a base64 image. Pass it in referenceImages as { filePath }, { url }, or { data, mimeType }. Then describe the change in prompt. For Seedream precise editing, put the source in referenceImages and write the region (absolute pixel coords from top-left) and the change into prompt.",
          "3. Iterate / style-swap: to make a variation of a just-generated image, reuse the previous result's path (images[].path) as referenceImages and give a new prompt (e.g. 'same subject, cyberpunk style').",
          "4. Batch compare: generate several variants by calling labnana_generate_image multiple times with different prompt styling; each is saved separately.",
          "5. Before generating, if the user cares about cost, call labnana_estimate_credits; to confirm the account has credits, call labnana_get_subscription.",
          "6. When the user attaches an image in chat and wants it edited, check whether you can read its local path first (it may be a temp attachment you cannot access). If you cannot read it, tell the user to provide a real file path or URL instead of guessing."
        ].join("\n")
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
  logger.info("dsh-labnana loaded (v%s)", PLUGIN_VERSION);
}
export {
  ASPECT_RATIOS,
  Config,
  ERROR_CODES,
  IMAGE_SIZES,
  MODELS,
  apply,
  inject,
  name,
  resolveKeyAsync,
  subscriptionSummary
};
