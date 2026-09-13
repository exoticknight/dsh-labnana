// dsh-labnana — Client 端（TypeScript/JSX）
// 设置卡片（官方 settingsScope + credentials 域 + i18n locale 席位）
// 对话流内生图结果卡片（官方 tool.call.toolview keyed 槽）
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, IconChevronDownOutline14 } from "@deepseek-ai/dsh-client-ui-primitives";
import officialCardCss from "./official/PluginCard.css";
import officialFieldsCss from "./official/fields.css";
import { createCredentials, saveFields, type CredentialState, type SettingsScope } from "./settings.js";

//#region css
const css = [
  officialCardCss,
  officialFieldsCss,
  ".dshln-testOk{color:#7ddb9c;font-size:12px;line-height:1.6}",
  ".dshln-testFail{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.6}",
  ".dshln-testing{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6}",
  ".dshln-badge{background:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-state-business-primary);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-badgeKey{background:rgba(240,170,80,.15);color:#f0b060;border:1px solid rgba(240,170,80,.3);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-badgeKeyOk{background:rgba(80,200,120,.15);color:#7ddb9c;border:1px solid rgba(80,200,120,.3);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-badgeKeyBad{background:rgba(240,120,110,.15);color:#f08a7a;border:1px solid rgba(240,120,110,.35);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-badgeNone{background:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l2);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-version{color:var(--dsw-alias-label-tertiary);font-size:11px;font-variant-numeric:tabular-nums;white-space:nowrap}",
  ".dshln-balance{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;padding:8px 10px;font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.7;display:flex;flex-direction:column;gap:2px;min-width:0}",
  ".dshln-balance b{color:var(--dsw-alias-label-primary);font-weight:600}",
  ".dshln-tool{padding:2px 0}",
  ".dshln-toolHead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}",
  ".dshln-toolTitle{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500}",
  ".dshln-toolMeta{color:var(--dsw-alias-label-secondary);font-size:12px}",
  ".dshln-toolBadge{background:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-state-business-primary);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-toolGrid{display:flex;flex-wrap:wrap;gap:8px}",
  ".dshln-toolImg{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);object-fit:contain;cursor:zoom-in;max-width:100%}",
  ".dshln-toolImgSingle{width:100%}",
  ".dshln-toolImgMulti{width:calc(50% - 4px);min-width:160px}",
  ".dshln-toolActions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}",
  ".dshln-toolLink{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:transparent;cursor:pointer;border-radius:6px;padding:3px 10px;font-size:12px;font:inherit}",
  ".dshln-toolLink:hover{border-color:var(--dsw-alias-label-dimmed)}",
  ".dshln-toolPath{color:var(--dsw-alias-label-tertiary);font-size:11px;font-variant-numeric:tabular-nums;word-break:break-all;margin:0}",
  ".dshln-toolErr{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-word;margin:0}",
  ".dshln-toolRun{color:var(--dsw-alias-label-secondary);font-size:12px;margin:0}",
  ".dshln-balance{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px;line-height:1.7}",
  ".dshln-testFail{color:var(--dsw-alias-label-error)}.dshln-testOk{color:var(--dsw-alias-label-primary)}",
].join("");
const tagId = "dsh-labnana/card.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-labnana";
  tag.dataset.pluginCss = tagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
//#endregion

const NS = "labnana";
const TEST_URL = "/api/dsh-labnana-settings/test";
const MODELS = [
  "gemini-3-pro-image",
  "gemini-3.1-flash-image",
  "gpt-image-2",
  "wan2.7-image-pro",
  "wan2.7-image",
  "seedream-5-0-pro",
];
const SIZES = ["1K", "2K", "4K"];
const sizesFor = (model: string) => model === "wan2.7-image" || model === "seedream-5-0-pro" ? SIZES.slice(0, 2) : SIZES;
const RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9", "1:4", "4:1", "1:8", "8:1"];

// 官方 locale 字典：ns × { zh, en }
const I18N = {
  zh: {
    title: "Labnana 图片生成",
    saved: "已保存",
    description: "Labnana 图片生成 —— 文生图 / 图生图 / 精准编辑（Gemini · GPT-Image-2 · Wan2.7 · Seedream）",
    expand: "展开设置",
    collapse: "收起设置",
    apiKey: "API Key",
    keyEmpty: "lh_… 在 labnana.com/api-keys 创建",
    keyPlaceholderConfigured: "已配置 · 输入新值可替换",
    keySrcCredentials: "凭据域",
    keySrcEnv: "环境变量",
    keyNone: "未配置",
    keyHint: "输入 Key 后可先测试连接，点击保存后生效。留空保留已保存的 Key。",
    keyReadonly: "当前凭据只读（由进程环境提供），无法在界面修改。",
    clearKey: "清除",
    test: "测试连接",
    retest: "重新测试",
    testing: "测试中…",
    testingLine: "正在测试连接…",
    testOkLine: "✓ 连接正常",
    testFailLine: "✗ 连接失败",
    balanceTitle: "账户余额",
    monthly: "月度积分",
    permanent: "永久积分",
    limited: "限时积分",
    freeUsage: "免费额度",
    plan: "套餐",
    paid: "已付费",
    renew: "自动续费",
    expires: "到期",
    unknown: "未知",
    defaultModel: "默认模型",
    defaultSize: "默认尺寸",
    defaultRatio: "默认宽高比",
    saveToDisk: "保存图片到磁盘",
    saveToDiskHint: "勾选后每次生成自动保存到当前项目 labnana-images/；不勾选则不落盘，可在对话卡片手动「保存到项目」",
    saveToProject: "保存到项目",
    savingToProject: "保存中…",
    savedToProject: "已保存",
    outputDir: "输出目录（留空 = workspace/labnana-images）",
    unsaved: "未保存",
    save: "保存",
    saving: "保存中…",
    discard: "放弃修改",
    loading: "加载中…",
    unavailable: "设置不可用 —— labnana 命名空间未被本部署服务。",
    readonly: "当前文档只读，无法保存。",
    saveFailed: "部分字段未能写入，请重试",
    toolTitle: "生成图片",
    toolTitleError: "生成图片失败",
    toolRunning: "正在生成…",
    toolRunningWith: "正在生成：",
    toolNoImages: "未返回图片",
    toolOpenFile: "打开文件",
    toolTaskId: "taskId ",
    version: "v",
  },
  en: {
    title: "Labnana image generation",
    saved: "Saved",
    description: "Labnana image generation — text-to-image / image-to-image / precise editing (Gemini · GPT-Image-2 · Wan2.7 · Seedream)",
    expand: "Show settings",
    collapse: "Hide settings",
    apiKey: "API Key",
    keyEmpty: "lh_… create one at labnana.com/api-keys",
    keyPlaceholderConfigured: "configured — type to replace",
    keySrcCredentials: "credentials",
    keySrcEnv: "env",
    keyNone: "not configured",
    keyHint: "Test the entered key before saving. Save applies it; leave blank to keep the saved key.",
    keyReadonly: "The referenced credential is read-only (provided by the process environment).",
    clearKey: "Clear",
    test: "Test connection",
    retest: "Test again",
    testing: "Testing…",
    testingLine: "Testing connection…",
    testOkLine: "✓ Connected",
    testFailLine: "✗ Connection failed",
    balanceTitle: "Account balance",
    monthly: "Monthly",
    permanent: "Permanent",
    limited: "Limited-time",
    freeUsage: "Free usage",
    plan: "Plan",
    paid: "Paid",
    renew: "Auto-renew",
    expires: "Expires",
    unknown: "unknown",
    defaultModel: "Default model",
    defaultSize: "Default size",
    defaultRatio: "Default ratio",
    saveToDisk: "Save images to disk",
    saveToDiskHint: "When checked, every generation is saved to <workspace>/labnana-images automatically; otherwise nothing is persisted and the chat card offers a 'Save to project' button.",
    saveToProject: "Save to project",
    savingToProject: "Saving…",
    savedToProject: "Saved",
    outputDir: "Output dir (empty = workspace/labnana-images)",
    unsaved: "unsaved",
    save: "Save",
    saving: "Saving…",
    discard: "Discard changes",
    loading: "Loading…",
    unavailable: "Settings unavailable — labnana namespace is not served by this deployment.",
    readonly: "The document is read-only; saving is disabled.",
    saveFailed: "some fields were not written; please retry",
    toolTitle: "Generate image",
    toolTitleError: "Image generation failed",
    toolRunning: "Generating…",
    toolRunningWith: "Generating: ",
    toolNoImages: "No image returned",
    toolOpenFile: "Open file",
    toolTaskId: "taskId ",
    version: "v",
  },
};

//#region 官方 API 轻量类型（client 侧无 npm 类型，按官方契约声明）
type Translate = (key: string) => string;


interface DescribeSnapshot {
  view?: {
    writable?: boolean;
    namespaces?: Array<{
      ns: string;
      value?: Record<string, unknown>;
      user?: Record<string, unknown>;
      secrets?: Array<{ path?: unknown[]; set?: boolean }>;
    }>;
  };
}

interface DescribeFace {
  getSnapshot(): DescribeSnapshot;
  subscribe(listener: () => void): () => void;
}


interface CardProps {
  t: Translate;
  scope: SettingsScope;
  describeFace: DescribeFace;
  credential: CredentialState;
  subscribeCredential(listener: (state: CredentialState) => void): () => void;
  writeKey(value: string): Promise<unknown>;
  unsetKey(): Promise<void>;
}

interface ToolBlock {
  kind?: string;
  callId: string;
  call?: { name?: string; argsRaw?: string } | null;
  argsRaw?: string;
  content?: unknown[];
  isError?: boolean;
  error?: { code?: string };
  meta?: unknown;
  subCalls: unknown[];
}

interface ToolRowProps {
  t: Translate;
  block: ToolBlock;
  openFile?(path: string): void;
}
//#endregion

async function bridgeTest(apiKey?: string): Promise<Record<string, any>> {
  try {
    const response = await fetch(TEST_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(apiKey ? { apiKey } : {}),
    });
    const json = await response.json();
    return json;
  } catch (error: any) {
    return { ok: false, code: "network", message: String(error && error.message ? error.message : error) };
  }
}

interface NamespaceRow {
  ns: string;
  value?: Record<string, unknown>;
  user?: Record<string, unknown>;
  secrets?: Array<{ path?: unknown[]; set?: boolean }>;
}

// 官方 settingsScope 镜像行的投影
function rowOf(viewSnapshot: DescribeSnapshot): NamespaceRow | null {
  const namespaces = viewSnapshot?.view && Array.isArray(viewSnapshot.view.namespaces) ? viewSnapshot.view.namespaces : [];
  return namespaces.find((candidate) => candidate.ns === NS) ?? null;
}

function LabnanaCard(props: CardProps) {
  const t = props.t; // 官方 locale 席位（slot 注册声明 locale: NS 后由框架注入）
  const { scope, describeFace, credential, subscribeCredential, writeKey, unsetKey } = props;
  const [view, setView] = useState<DescribeSnapshot>(() => describeFace.getSnapshot());
  const [cred, setCred] = useState<CredentialState>(credential);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<Record<string, any> | null>(null);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [model, setModel] = useState("");
  const [size, setSize] = useState("");
  const [ratio, setRatio] = useState("");
  const [saveToDisk, setSaveToDisk] = useState(false);
  const [outputDir, setOutputDir] = useState("");
  const [open, setOpen] = useState(false);
  const autoTestedRef = useRef(false);

  // 订阅官方设置镜像（文档提交/重连时刷新；也覆盖本卡片写入后的回读）
  useEffect(() => describeFace.subscribe(() => setView(describeFace.getSnapshot())), [describeFace]);
  // 订阅凭据域状态（describe RPC / credentials/reference-updated 事件驱动）
  useEffect(() => subscribeCredential((state) => setCred({ ...state })), [subscribeCredential]);

  const row = rowOf(view);
  const value = (row && row.value) || {};
  const user = (row && row.user) || {};
  const loading = !view || !view.view;
  const unavailable = !loading && row === null;
  const writable = view && view.view ? view.view.writable !== false : false;
  const keyConfigured = cred.configured === true;
  const keyWritable = cred.writable !== false;

  // 后台镜像刷新时保留尚未保存的输入。
  useEffect(() => {
    if (!row || dirty) return;
    setModel(typeof value.defaultModel === "string" ? value.defaultModel : "gemini-3-pro-image");
    setSize(typeof value.defaultImageSize === "string" ? value.defaultImageSize : "2K");
    setRatio(typeof value.defaultAspectRatio === "string" ? value.defaultAspectRatio : "1:1");
    setSaveToDisk(value.saveToDisk === true);
    setOutputDir(typeof value.outputDir === "string" ? value.outputDir : "");
    setKeyInput("");
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, dirty]);

  const test = useCallback(async (apiKey?: string) => {
    setTesting(true);
    setTestResult(null);
    const result = await bridgeTest(apiKey);
    if (result.ok) {
      setTestResult({ ok: true, value: result.value, keyState: result.keyState });
    } else {
      setTestResult({ ok: false, code: result.code, message: result.message || t("testFailLine"), keyState: result.keyState });
    }
    setTesting(false);
  }, [t]);

  // 有 key 时自动测试一次连接，让状态一打开就可见
  useEffect(() => {
    if (open && keyConfigured && !saving && !keyInput && !autoTestedRef.current) {
      autoTestedRef.current = true;
      test();
    }
  }, [open, keyConfigured, saving, keyInput, test]);

  const save = useCallback(async () => {
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      if (keyInput.trim()) {
        await writeKey(keyInput.trim());
        setKeyInput("");
      }
      const fields: Array<[string, unknown]> = [
        ["defaultModel", model],
        ["defaultImageSize", size],
        ["defaultAspectRatio", ratio],
        ["saveToDisk", saveToDisk],
        ["outputDir", outputDir],
      ];
      await saveFields(scope, fields);
      setDirty(false);
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally { setSaving(false); }
  }, [keyInput, model, size, ratio, saveToDisk, outputDir, scope, writeKey]);

  const clearKey = useCallback(async () => {
    setSaving(true);
    setSaveError("");
    try {
      await unsetKey();
      setKeyInput("");
      setTestResult(null);
    } catch (error) { setSaveError(error instanceof Error ? error.message : String(error)); }
    finally { setSaving(false); }
  }, [unsetKey]);

  const discard = useCallback(() => {
    if (!row) return;
    setModel(typeof value.defaultModel === "string" ? value.defaultModel : "gemini-3-pro-image");
    setSize(typeof value.defaultImageSize === "string" ? value.defaultImageSize : "2K");
    setRatio(typeof value.defaultAspectRatio === "string" ? value.defaultAspectRatio : "1:1");
    setSaveToDisk(value.saveToDisk === true);
    setOutputDir(typeof value.outputDir === "string" ? value.outputDir : "");
    setKeyInput("");
    setDirty(false);
    setTestResult(null);
    setSaveError("");
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  const mark = () => { setDirty(true); setSaved(false); setSaveError(""); };

  // keyState 来源（test 端点响应）：credentials（凭据域引用）> env（进程环境）
  const keySource = testResult && testResult.keyState ? testResult.keyState.source : "";
  const keySrcLabel = keySource === "credentials" ? t("keySrcCredentials") : keySource === "env" ? t("keySrcEnv") : "";
  const keyRef = testResult && testResult.keyState && testResult.keyState.ref ? testResult.keyState.ref : cred.ref || "";
  const keyMasked = testResult && testResult.keyState ? testResult.keyState.masked : "";

  const balance = testResult && testResult.ok && testResult.value ? testResult.value : null;
  const testFailed = testResult && !testResult.ok ? testResult : null;
  const freeLines = balance && Array.isArray(balance.freeUsages) ? balance.freeUsages : [];
  const expiresAt = balance && balance.subscriptionExpiresAt ? new Date(balance.subscriptionExpiresAt).toLocaleDateString() : null;

  const keyPlaceholder = keyConfigured ? t("keyPlaceholderConfigured") : t("keyEmpty");
  const keyHint = keyConfigured && !keyWritable ? t("keyReadonly") : t("keyHint");

  const keyBadge = !keyConfigured ? (
    <span className="dshln-badgeNone">{t("apiKey")} · {t("keyNone")}</span>
  ) : testResult && testResult.ok ? (
    <span className="dshln-badgeKeyOk">{t("apiKey")} · {keySrcLabel || t("keySrcCredentials")}{keyMasked ? " · " + keyMasked : ""} · ✓</span>
  ) : testResult && !testResult.ok ? (
    <span className="dshln-badgeKeyBad">{t("apiKey")} · {keySrcLabel || t("keySrcCredentials")}{keyMasked ? " · " + keyMasked : ""} · ✗</span>
  ) : (
    <span className="dshln-badgeKey">{t("apiKey")} · {keySrcLabel || t("keySrcCredentials")}{keyMasked ? " · " + keyMasked : ""}</span>
  );

  return (
    <li className={"dshln-card" + (open ? " dshln-cardOpen" : "")} style={{ listStyle: "none" }}>
      <button
        type="button"
        className="dshln-cardHeader"
        aria-expanded={open}
        aria-label={(open ? t("collapse") : t("expand")) + ": " + t("title")}
        onClick={() => setOpen(!open)}
      >
        <span className="dshln-cardHeadText">
          <span className="dshln-cardTitle">
            {t("title")}
            <span className="dshln-version" style={{ marginLeft: 8 }}>{t("version")}{__LABNANA_VERSION__}</span>
          </span>
          <span className="dshln-desc">{t("description")}</span>
        </span>
        {dirty ? <span className="dshln-badge">{t("unsaved")}</span> : null}
        <IconChevronDownOutline14 className={"dshln-chevron" + (open ? " dshln-chevronOpen" : "")} />
      </button>
      {open ? (
        <div className="dshln-body">
          {loading ? (
          <p className="dshln-hint">{t("loading")}</p>
        ) : unavailable ? (
          <p className="dshln-testFail">{t("unavailable")}</p>
        ) : (
          <>
            {!writable ? <p className="dshln-hint">{t("readonly")}</p> : null}
            <div className="dshln-field">
              <label className="dshln-label">{t("apiKey")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  aria-label={t("apiKey")}
                  className="dshln-input"
                  type="password"
                  placeholder={keyPlaceholder}
                  value={keyInput}
                  autoComplete="new-password"
                  spellCheck={false}
                  disabled={saving || testing || !keyWritable}
                  onChange={(e) => {
                    setKeyInput(e.target.value);
                    mark();
                    setTestResult(null);
                  }}
                  style={{ flex: 1 }}
                />
                {keyConfigured ? (
                  <Button variant="outline" size="sm" type="button" onClick={clearKey} disabled={saving || testing || !keyWritable}>
                    {t("clearKey")}
                  </Button>
                ) : null}
              </div>
              <p className="dshln-hint">{keyHint}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {keyBadge}
                <Button variant="outline" size="sm" type="button" onClick={() => test(keyInput.trim())} disabled={testing || saving}>
                  {testing ? t("testing") : keyConfigured ? t("retest") : t("test")}
                </Button>
              </div>
              {testing ? <p className="dshln-testing">{t("testingLine")}</p> : null}
              {testFailed ? (
                <p className="dshln-testFail">
                  {t("testFailLine")}
                  {testFailed.code ? " · [" + testFailed.code + "]" : ""}
                  {testFailed.message ? " " + String(testFailed.message) : ""}
                </p>
              ) : null}
              {balance && testResult && testResult.ok ? <p className="dshln-testOk">{t("testOkLine")}</p> : null}
            </div>
            {balance ? (
              <div className="dshln-balance">
                <div>
                  {t("balanceTitle")}: <b>{String(balance.totalAvailableCredits ?? 0)}</b>
                </div>
                <div>
                  {t("monthly")} {String(balance.monthlyAvailable ?? 0)}/{String(balance.monthlyTotal ?? 0)} · {t("permanent")}{" "}
                  {String(balance.permanentAvailable ?? 0)} · {t("limited")} {String(balance.limitedTimeAvailable ?? 0)}
                </div>
                {freeLines.length > 0 ? (
                  <div>
                    {t("freeUsage")}:{" "}
                    {freeLines.map((f: any) => (f.unlimited ? f.resourceKey + " ∞" : f.resourceKey + " ×" + String(f.remaining))).join("，")}
                  </div>
                ) : null}
                <div>
                  {t("plan")}: {String(balance.plan || (balance.paidStatus ? t("paid") : t("unknown")))}
                  {expiresAt ? " · " + t("expires") + " " + expiresAt : ""}
                  {balance.paidStatus ? " · " + t("paid") : ""}
                  {balance.renewStatus ? " · " + t("renew") : ""}
                </div>
              </div>
            ) : null}
            <>
              <div className="dshln-field">
                <label className="dshln-label">{t("defaultModel")}</label>
                <select aria-label={t("defaultModel")} className="dshln-input" value={model} disabled={saving || testing || !writable} onChange={(e) => { setModel(e.target.value); if (!sizesFor(e.target.value).includes(size)) setSize("2K"); mark(); }}>
                  {MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="dshln-field">
                <label className="dshln-label">{t("defaultSize")}</label>
                <select aria-label={t("defaultSize")} className="dshln-input" value={size} disabled={saving || testing || !writable} onChange={(e) => { setSize(e.target.value); mark(); }}>
                  {sizesFor(model).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="dshln-field">
                <label className="dshln-label">{t("defaultRatio")}</label>
                <select aria-label={t("defaultRatio")} className="dshln-input" value={ratio} disabled={saving || testing || !writable} onChange={(e) => { setRatio(e.target.value); mark(); }}>
                  {RATIOS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </>
            <div className="dshln-field">
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: writable ? "pointer" : "default" }}>
                <input
                  type="checkbox"
                  checked={saveToDisk}
                  disabled={saving || testing || !writable}
                  onChange={(e) => {
                    setSaveToDisk(e.target.checked);
                    mark();
                  }}
                />
                <span className="dshln-label" style={{ margin: 0 }}>{t("saveToDisk")}</span>
              </label>
              <p className="dshln-hint">{t("saveToDiskHint")}</p>
            </div>
            <div className="dshln-field">
              <label className="dshln-label">{t("outputDir")}</label>
              <input
                aria-label={t("outputDir")}
                className="dshln-input"
                type="text"
                value={outputDir}
                spellCheck={false}
                disabled={saving || testing || !writable}
                onChange={(e) => {
                  setOutputDir(e.target.value);
                  mark();
                }}
              />
            </div>
            {saveError || cred.error ? <p role="alert" className="dshln-testFail">{t("saveFailed")} {saveError || cred.error}</p> : null}
            <div className="dshln-footer">
              <span role="status" className="dshln-hint" style={{ marginRight: "auto" }}>{dirty ? t("unsaved") : saved ? t("saved") : ""}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="dshln-discardAction" type="button" onClick={discard} disabled={saving || testing || !dirty || !writable}>
                  {t("discard")}
                </button>
                <button className="dshln-saveAction" type="button" onClick={save} disabled={saving || testing || !dirty || !writable}>
                  {saving ? t("saving") : t("save")}
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      ) : null}
    </li>
  );
}

// 对话流内生图结果卡片（tool.call.toolview keyed 槽，替换 generic 行）
// block 契约（官方 ToolCallOwnerProps + ToolResultNode/RunningToolCall）：
// 运行中无 kind；完成后 { kind:"tool-result", call:{name,argsRaw}, content, isError, error?, meta, subCalls }
// meta 为 host presentationMeta 持久化的可回放结果事实（images[{url,path,mimeType,size}] 等）。
function LabnanaToolRow(props: ToolRowProps) {
  const { t } = props;
  const { block, openFile } = props;
  // 手动保存状态：name -> "saving" | "saved"（仅未落盘模式下出现）
  const [savedState, setSavedState] = useState<Record<string, string>>({});
  const done = Boolean(block && block.kind === "tool-result");
  let args: Record<string, any> = {};
  try {
    const raw = done && block.call && typeof block.call.argsRaw === "string" ? block.call.argsRaw : block && typeof block.argsRaw === "string" ? block.argsRaw : "{}";
    args = JSON.parse(raw) || {};
  } catch {}
  const prompt = typeof args.prompt === "string" ? args.prompt : "";
  const reqModel = typeof args.model === "string" ? args.model : "";
  const reqSize = typeof args.imageSize === "string" ? args.imageSize : "";
  const meta = done && block.meta && typeof block.meta === "object" ? (block.meta as Record<string, any>) : null;
  const images = meta && Array.isArray(meta.images) ? meta.images : [];
  const resModel = meta && typeof meta.model === "string" ? meta.model : reqModel;
  const resSize = meta && typeof meta.imageSize === "string" ? meta.imageSize : reqSize;
  const ratio = meta && typeof meta.aspectRatio === "string" ? meta.aspectRatio : (typeof args.aspectRatio === "string" ? args.aspectRatio : "");
  const taskId = meta && typeof meta.taskId === "string" ? meta.taskId : "";
  // 未落盘（saveToDisk=false / 未传 saveDir）时卡片提供"保存到项目"
  const notSaved = meta && meta.saved !== true;

  const nameOf = (img: Record<string, any>) => {
    const url = typeof img.url === "string" ? img.url : "";
    const m = url.match(/\/api\/dsh-labnana-images\/([^/?]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  };
  const saveToProject = async (img: Record<string, any>) => {
    const name = nameOf(img);
    if (!name || savedState[name]) return;
    setSavedState((s) => ({ ...s, [name]: "saving" }));
    try {
      const response = await fetch("/api/dsh-labnana-images/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await response.json();
      setSavedState((s) => ({ ...s, [name]: json && json.ok ? "saved" : "" }));
    } catch {
      setSavedState((s) => ({ ...s, [name]: "" }));
    }
  };

  return (
    <div className="dshln-tool">
      <div className="dshln-toolHead">
        <span className="dshln-toolTitle">{done && block.isError ? t("toolTitleError") : t("toolTitle")}</span>
        {resModel || reqModel ? <span className="dshln-toolBadge">{[resModel || reqModel, resSize || reqSize, ratio].filter(Boolean).join(" · ")}</span> : null}
        {taskId ? <span className="dshln-toolMeta">{t("toolTaskId")}{taskId}</span> : null}
      </div>
      {!done ? (
        <p className="dshln-toolRun">{prompt ? t("toolRunningWith") + prompt : t("toolRunning")}</p>
      ) : block.isError ? (
        <p className="dshln-toolErr">
          {(block.error && block.error.code ? "[" + block.error.code + "] " : "") +
            (Array.isArray(block.content)
              ? block.content.filter((c: any) => c && c.type === "text" && typeof c.text === "string").map((c: any) => c.text).join("\n")
              : "") || t("toolTitleError")}
        </p>
      ) : images.length === 0 ? (
        <p className="dshln-toolRun">{t("toolNoImages")}</p>
      ) : (
        <div>
          <div className="dshln-toolGrid">
            {images.map((img: Record<string, any>, i: number) => {
              const url = typeof img.url === "string" ? img.url : "";
              const path = typeof img.path === "string" ? img.path : "";
              const imgEl = url ? (
                <img
                  className={"dshln-toolImg " + (images.length === 1 ? "dshln-toolImgSingle" : "dshln-toolImgMulti")}
                  src={url}
                  alt={path || "labnana-" + i}
                  loading="lazy"
                  onClick={() => {
                    const win = window.open(url, "_blank");
                    if (win) win.focus();
                  }}
                />
              ) : null;
              if (!url || !path) return <figure key={i}>{imgEl}</figure>;
              return (
                <figure key={i} style={{ margin: 0, flex: images.length === 1 ? "1 1 100%" : "1 1 calc(50% - 4px)", minWidth: 0 }}>
                  {imgEl}
                  <figcaption className="dshln-toolPath">{path}</figcaption>
                </figure>
              );
            })}
          </div>
          <div className="dshln-toolActions">
            {images.map((img: Record<string, any>, i: number) => {
              const path = typeof img.path === "string" ? img.path : "";
              if (!path) return null;
              return (
                <button key={i} className="dshln-toolLink" type="button" onClick={() => { if (typeof openFile === "function") openFile(path); }}>
                  {t("toolOpenFile")} {i + 1}
                </button>
              );
            })}
            {notSaved
              ? images.map((img: Record<string, any>, i: number) => {
                  const name = nameOf(img);
                  if (!name) return null;
                  const state = savedState[name];
                  const label = state === "saved" ? t("savedToProject") : state === "saving" ? t("savingToProject") : t("saveToProject") + (images.length > 1 ? " " + (i + 1) : "");
                  return (
                    <button key={"save" + i} className="dshln-toolLink" type="button" onClick={() => saveToProject(img)} disabled={Boolean(state)}>
                      {label}
                    </button>
                  );
                })
              : null}
            {prompt ? <span className="dshln-toolMeta">{prompt}</span> : null}
          </div>
        </div>
      )}
    </div>
  );
}

const inject = ["slots", "settingsScope", "remote", "remote.credentials", "locale"];

function apply(ctx: any) {
  // 官方 locale：注册字典（ns × {zh, en}），slot 组件经框架注入的标准 t 席位取翻译
  ctx.effect(() => ctx.locale.register("labnana", { zh: I18N.zh, en: I18N.en }), "dsh-labnana: locale dictionary");
  // 官方 settingsScope：绑定 labnana 命名空间的读写 scope + 共享镜像读面
  const scope = ctx.settingsScope.bind({ namespace: NS }) as SettingsScope;
  const describeFace = ctx.settingsScope.describe() as DescribeFace;
  // 官方凭据域（connection wire face）：密钥经 credentials 读写，不进入 settings
  const DEFAULT_API_KEY_REF = "LABNANA_API_KEY";
  const refOf = () => {
    const row = rowOf(describeFace.getSnapshot());
    const declared = row && row.value && typeof row.value.apiKeyEnv === "string" ? row.value.apiKeyEnv : "";
    return declared.length > 0 ? declared : DEFAULT_API_KEY_REF;
  };
  const credentials = createCredentials(ctx.remote.credentials, refOf);
  const readCredential = () => credentials.refresh();
  ctx.effect(() => ctx.remote.$on("credentials/reference-updated", (ref: string) => {
    if (ref === refOf()) void readCredential();
  }), "dsh-labnana: credential updates");
  ctx.effect(() => scope.subscribe(() => {
    if (refOf() !== credentials.getSnapshot().ref) void readCredential();
  }), "dsh-labnana: credential reference");
  ctx.effect(() => () => credentials.dispose(), "dsh-labnana: credentials cleanup");
  void readCredential();
  const credentialStore = credentials.getSnapshot();
  const subscribeCredential = credentials.subscribe;
  const writeKey = credentials.write;
  const unsetKey = credentials.clear;
  // t 由框架注入（注册声明 locale 后随 props 传入），不在 cardProps 里覆盖
  const cardProps: Omit<CardProps, "t"> = { scope, describeFace, credential: credentialStore, subscribeCredential, writeKey, unsetKey };

  // 挂官方插槽 settings.plugin.item（设置 → 插件 → 可配置标签页）
  // t 不放进 cardProps：注册声明 locale: "labnana" 后框架会注入翻译席位，
  // 若在这里塞入桩函数会因展开顺序覆盖框架注入的 t，导致设置文字全部空白。
  ctx.slots.inject("settings.plugin.item", () =>
    ctx.slots.register(
      {
        name: "settings.plugin.item",
        key: "labnana",
        id: "dsh-labnana",
        order: 130,
        locale: "labnana",
        inject: () => ({}),
      },
      (props: any) => <LabnanaCard {...props} {...cardProps} />
    )
  );
  // 对话流内生图结果卡片（官方 ui-tool 的 keyed tool.call.toolview 槽，key=工具名）
  ctx.slots.inject("tool.call.toolview", () =>
    ctx.slots.register(
      {
        name: "tool.call.toolview",
        key: "labnana_generate_image",
        id: "dsh-labnana",
        locale: "labnana",
      },
      LabnanaToolRow as any
    )
  );
}

export { apply, inject };
