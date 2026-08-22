window.__ModuleLoader__.load({
  id: "dsh-labnana",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/entry.ts
var entry_exports = {};
__export(entry_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(entry_exports);

// src/client/index.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var css = [
  ".dshln-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:8px;min-width:0;list-style:none;overflow:hidden;margin-bottom:8px}",
  ".dshln-cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}",
  ".dshln-cardHeader{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:transparent;border:0;display:flex;align-items:center;gap:12px;padding:14px 16px}",
  ".dshln-cardHeader:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}",
  ".dshln-cardHeadText{display:flex;flex-direction:column;flex:1;min-width:0;gap:4px}",
  ".dshln-cardTitle{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}",
  ".dshln-chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}",
  ".dshln-chevronOpen{transform:rotate(180deg)}",
  ".dshln-body{border-top:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:14px;padding:14px;display:flex}",
  ".dshln-field{flex-direction:column;gap:4px;min-width:0;display:flex}",
  ".dshln-label{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500}",
  ".dshln-input{border:1px solid var(--dsw-alias-border-l2);font:inherit;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);background:var(--dsw-specific-input-major);border-radius:6px;padding:6px 8px;font-size:13px;transition:border-color .13s,box-shadow .13s;width:100%}",
  ".dshln-input:hover:not(:disabled){border-color:var(--dsw-alias-label-dimmed)}",
  ".dshln-input:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}",
  ".dshln-input:disabled{opacity:.6;cursor:default}",
  ".dshln-select{border:1px solid var(--dsw-alias-border-l2);font:inherit;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);background:var(--dsw-specific-input-major);border-radius:6px;padding:6px 8px;font-size:13px;transition:border-color .13s,box-shadow .13s;width:100%}",
  ".dshln-select:hover:not(:disabled){border-color:var(--dsw-alias-label-dimmed)}",
  ".dshln-select:disabled{opacity:.6;cursor:default}",
  ".dshln-hint{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px}",
  ".dshln-row{display:flex;gap:10px;flex-wrap:wrap}",
  ".dshln-row>.dshln-field{flex:1 1 160px;min-width:0}",
  ".dshln-footer{justify-content:space-between;align-items:center;gap:8px;display:flex;flex-wrap:wrap}",
  ".dshln-btn{font:inherit;cursor:pointer;border-radius:6px;padding:5px 12px;font-size:13px;transition:background-color .13s,border-color .13s,color .13s}",
  ".dshln-save{border:1px solid var(--dsw-alias-button-info-fill);background:var(--dsw-alias-button-info-fill);color:var(--dsw-alias-label-primary-foreground)}",
  ".dshln-save:hover:not(:disabled){border-color:var(--dsw-alias-button-info-hover);background:var(--dsw-alias-button-info-hover)}",
  ".dshln-save:disabled{opacity:.5;cursor:default}",
  ".dshln-ghost{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:transparent}",
  ".dshln-ghost:hover:not(:disabled){border-color:var(--dsw-alias-label-dimmed)}",
  ".dshln-ghost:disabled{opacity:.5;cursor:default}",
  ".dshln-testOk{color:#7ddb9c;font-size:12px;line-height:1.6}",
  ".dshln-testFail{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.6}",
  ".dshln-testing{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6}",
  ".dshln-badge{background:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-state-business-primary);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-badgeKey{background:rgba(240,170,80,.15);color:#f0b060;border:1px solid rgba(240,170,80,.3);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-badgeKeyOk{background:rgba(80,200,120,.15);color:#7ddb9c;border:1px solid rgba(80,200,120,.3);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-badgeKeyBad{background:rgba(240,120,110,.15);color:#f08a7a;border:1px solid rgba(240,120,110,.35);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-badgeNone{background:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l2);white-space:nowrap;border-radius:999px;flex:none;padding:1px 6px;font-size:11px}",
  ".dshln-desc{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px}",
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
  ".dshln-toolRun{color:var(--dsw-alias-label-secondary);font-size:12px;margin:0}"
].join("");
var tagId = "dsh-labnana/card.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-labnana";
  tag.dataset.pluginCss = tagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
var NS = "labnana";
var TEST_URL = "/api/dsh-labnana-settings/test";
var MODELS = [
  "gemini-3-pro-image",
  "gemini-3.1-flash-image",
  "gpt-image-2",
  "wan2.7-image-pro",
  "wan2.7-image",
  "seedream-5-0-pro"
];
var SIZES = ["1K", "2K", "4K"];
var RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9", "1:4", "4:1", "1:8", "8:1"];
var I18N = {
  zh: {
    title: "Labnana \u56FE\u7247\u751F\u6210",
    description: "Labnana \u56FE\u7247\u751F\u6210 \u2014\u2014 \u6587\u751F\u56FE / \u56FE\u751F\u56FE / \u7CBE\u51C6\u7F16\u8F91\uFF08Gemini \xB7 GPT-Image-2 \xB7 Wan2.7 \xB7 Seedream\uFF09",
    expand: "\u5C55\u5F00\u8BBE\u7F6E",
    collapse: "\u6536\u8D77\u8BBE\u7F6E",
    apiKey: "API Key",
    keyEmpty: "lh_\u2026 \u5728 labnana.com/api-keys \u521B\u5EFA",
    keyPlaceholderConfigured: "\u5DF2\u914D\u7F6E \xB7 \u8F93\u5165\u65B0\u503C\u53EF\u66FF\u6362",
    keySrcCredentials: "\u51ED\u636E\u57DF",
    keySrcEnv: "\u73AF\u5883\u53D8\u91CF",
    keyNone: "\u672A\u914D\u7F6E",
    keyHint: "\u5BC6\u94A5\u4E0D\u5199\u5165\u8BBE\u7F6E\u6587\u4EF6\uFF0C\u5B58\u4E8E\u51ED\u636E\u57DF\uFF08~/.dsh/.credentials.yaml\uFF09\u3002\u7559\u7A7A\u4FDD\u6301\u5F53\u524D\u5BC6\u94A5\u3002",
    keyReadonly: "\u5F53\u524D\u51ED\u636E\u53EA\u8BFB\uFF08\u7531\u8FDB\u7A0B\u73AF\u5883\u63D0\u4F9B\uFF09\uFF0C\u65E0\u6CD5\u5728\u754C\u9762\u4FEE\u6539\u3002",
    clearKey: "\u6E05\u9664",
    test: "\u6D4B\u8BD5\u8FDE\u63A5",
    retest: "\u91CD\u65B0\u6D4B\u8BD5",
    testing: "\u6D4B\u8BD5\u4E2D\u2026",
    testingLine: "\u6B63\u5728\u6D4B\u8BD5\u8FDE\u63A5\u2026",
    testOkLine: "\u2713 \u8FDE\u63A5\u6B63\u5E38",
    testFailLine: "\u2717 \u8FDE\u63A5\u5931\u8D25",
    balanceTitle: "\u8D26\u6237\u4F59\u989D",
    monthly: "\u6708\u5EA6\u79EF\u5206",
    permanent: "\u6C38\u4E45\u79EF\u5206",
    limited: "\u9650\u65F6\u79EF\u5206",
    freeUsage: "\u514D\u8D39\u989D\u5EA6",
    plan: "\u5957\u9910",
    paid: "\u5DF2\u4ED8\u8D39",
    renew: "\u81EA\u52A8\u7EED\u8D39",
    expires: "\u5230\u671F",
    unknown: "\u672A\u77E5",
    defaultModel: "\u9ED8\u8BA4\u6A21\u578B",
    defaultSize: "\u9ED8\u8BA4\u5C3A\u5BF8",
    defaultRatio: "\u9ED8\u8BA4\u5BBD\u9AD8\u6BD4",
    saveToDisk: "\u4FDD\u5B58\u56FE\u7247\u5230\u78C1\u76D8",
    saveToDiskHint: "\u52FE\u9009\u540E\u6BCF\u6B21\u751F\u6210\u81EA\u52A8\u4FDD\u5B58\u5230\u5F53\u524D\u9879\u76EE labnana-images/\uFF1B\u4E0D\u52FE\u9009\u5219\u4E0D\u843D\u76D8\uFF0C\u53EF\u5728\u5BF9\u8BDD\u5361\u7247\u624B\u52A8\u300C\u4FDD\u5B58\u5230\u9879\u76EE\u300D",
    saveToProject: "\u4FDD\u5B58\u5230\u9879\u76EE",
    savingToProject: "\u4FDD\u5B58\u4E2D\u2026",
    savedToProject: "\u5DF2\u4FDD\u5B58",
    outputDir: "\u8F93\u51FA\u76EE\u5F55\uFF08\u7559\u7A7A = workspace/labnana-images\uFF09",
    unsaved: "\u672A\u4FDD\u5B58",
    save: "\u4FDD\u5B58",
    saving: "\u4FDD\u5B58\u4E2D\u2026",
    discard: "\u64A4\u9500",
    loading: "\u52A0\u8F7D\u4E2D\u2026",
    unavailable: "\u8BBE\u7F6E\u4E0D\u53EF\u7528 \u2014\u2014 labnana \u547D\u540D\u7A7A\u95F4\u672A\u88AB\u672C\u90E8\u7F72\u670D\u52A1\u3002",
    readonly: "\u5F53\u524D\u6587\u6863\u53EA\u8BFB\uFF0C\u65E0\u6CD5\u4FDD\u5B58\u3002",
    saveFailed: "\u90E8\u5206\u5B57\u6BB5\u672A\u80FD\u5199\u5165\uFF0C\u8BF7\u91CD\u8BD5",
    toolTitle: "\u751F\u6210\u56FE\u7247",
    toolTitleError: "\u751F\u6210\u56FE\u7247\u5931\u8D25",
    toolRunning: "\u6B63\u5728\u751F\u6210\u2026",
    toolRunningWith: "\u6B63\u5728\u751F\u6210\uFF1A",
    toolNoImages: "\u672A\u8FD4\u56DE\u56FE\u7247",
    toolOpenFile: "\u6253\u5F00\u6587\u4EF6",
    toolTaskId: "taskId ",
    version: "v"
  },
  en: {
    title: "Labnana image generation",
    description: "Labnana image generation \u2014 text-to-image / image-to-image / precise editing (Gemini \xB7 GPT-Image-2 \xB7 Wan2.7 \xB7 Seedream)",
    expand: "Show settings",
    collapse: "Hide settings",
    apiKey: "API Key",
    keyEmpty: "lh_\u2026 create one at labnana.com/api-keys",
    keyPlaceholderConfigured: "configured \u2014 type to replace",
    keySrcCredentials: "credentials",
    keySrcEnv: "env",
    keyNone: "not configured",
    keyHint: "Stored in the credentials domain (~/.dsh/.credentials.yaml), never in settings. Leave blank to keep the current key.",
    keyReadonly: "The referenced credential is read-only (provided by the process environment).",
    clearKey: "Clear",
    test: "Test connection",
    retest: "Test again",
    testing: "Testing\u2026",
    testingLine: "Testing connection\u2026",
    testOkLine: "\u2713 Connected",
    testFailLine: "\u2717 Connection failed",
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
    savingToProject: "Saving\u2026",
    savedToProject: "Saved",
    outputDir: "Output dir (empty = workspace/labnana-images)",
    unsaved: "unsaved",
    save: "Save",
    saving: "Saving\u2026",
    discard: "Discard",
    loading: "Loading\u2026",
    unavailable: "Settings unavailable \u2014 labnana namespace is not served by this deployment.",
    readonly: "The document is read-only; saving is disabled.",
    saveFailed: "some fields were not written; please retry",
    toolTitle: "Generate image",
    toolTitleError: "Image generation failed",
    toolRunning: "Generating\u2026",
    toolRunningWith: "Generating: ",
    toolNoImages: "No image returned",
    toolOpenFile: "Open file",
    toolTaskId: "taskId ",
    version: "v"
  }
};
async function bridgeTest() {
  try {
    const response = await fetch(TEST_URL, { method: "POST", headers: { "content-type": "application/json" } });
    const json = await response.json();
    return json;
  } catch (error) {
    return { ok: false, code: "network", message: String(error && error.message ? error.message : error) };
  }
}
function rowOf(viewSnapshot) {
  const namespaces = viewSnapshot?.view && Array.isArray(viewSnapshot.view.namespaces) ? viewSnapshot.view.namespaces : [];
  return namespaces.find((candidate) => candidate.ns === NS) ?? null;
}
function LabnanaCard(props) {
  const t = props.t;
  const { scope, describeFace, credential, subscribeCredential, writeKey, unsetKey } = props;
  const [view, setView] = (0, import_react.useState)(() => describeFace.getSnapshot());
  const [cred, setCred] = (0, import_react.useState)(credential);
  const [dirty, setDirty] = (0, import_react.useState)(false);
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [testing, setTesting] = (0, import_react.useState)(false);
  const [testResult, setTestResult] = (0, import_react.useState)(null);
  const [keyInput, setKeyInput] = (0, import_react.useState)("");
  const [model, setModel] = (0, import_react.useState)("");
  const [size, setSize] = (0, import_react.useState)("");
  const [ratio, setRatio] = (0, import_react.useState)("");
  const [saveToDisk, setSaveToDisk] = (0, import_react.useState)(false);
  const [outputDir, setOutputDir] = (0, import_react.useState)("");
  const [open, setOpen] = (0, import_react.useState)(false);
  const autoTestedRef = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => describeFace.subscribe(() => setView(describeFace.getSnapshot())), [describeFace]);
  (0, import_react.useEffect)(() => subscribeCredential(setCred), [subscribeCredential]);
  const row = rowOf(view);
  const value = row && row.value || {};
  const user = row && row.user || {};
  const loading = !view || !view.view;
  const unavailable = !loading && row === null;
  const writable = view && view.view ? view.view.writable !== false : false;
  const keyConfigured = cred.configured === true;
  const keyWritable = cred.writable !== false;
  (0, import_react.useEffect)(() => {
    if (!row) return;
    setModel(typeof value.defaultModel === "string" ? value.defaultModel : "gemini-3-pro-image");
    setSize(typeof value.defaultImageSize === "string" ? value.defaultImageSize : "2K");
    setRatio(typeof value.defaultAspectRatio === "string" ? value.defaultAspectRatio : "1:1");
    setSaveToDisk(value.saveToDisk === true);
    setOutputDir(typeof value.outputDir === "string" ? value.outputDir : "");
    setKeyInput("");
    setDirty(false);
  }, [view]);
  const test = (0, import_react.useCallback)(async () => {
    setTesting(true);
    setTestResult(null);
    const result = await bridgeTest();
    if (result.ok) {
      setTestResult({ ok: true, value: result.value, keyState: result.keyState });
    } else {
      setTestResult({ ok: false, code: result.code, message: result.message || t("testFailLine"), keyState: result.keyState });
    }
    setTesting(false);
  }, [t]);
  (0, import_react.useEffect)(() => {
    if (keyConfigured && !autoTestedRef.current) {
      autoTestedRef.current = true;
      test();
    }
  }, [keyConfigured, test]);
  const save = (0, import_react.useCallback)(async () => {
    setSaving(true);
    if (keyInput.length > 0) await writeKey(keyInput);
    const fields = [
      ["defaultModel", model],
      ["defaultImageSize", size],
      ["defaultAspectRatio", ratio],
      ["saveToDisk", saveToDisk],
      ["outputDir", outputDir]
    ];
    for (const [field, fieldValue] of fields) await scope.set(field, fieldValue);
    const fresh = rowOf(describeFace.getSnapshot());
    const freshUser = fresh && fresh.user || {};
    const keyOk = keyInput.length === 0 || cred.configured === true;
    const plainOk = fields.every(([f]) => f in freshUser);
    if (keyOk && plainOk) {
      setDirty(false);
      setKeyInput("");
      if (keyInput.length > 0) {
        autoTestedRef.current = false;
        test();
      }
    } else {
      setTestResult({ ok: false, message: t("saveFailed") });
    }
    setSaving(false);
  }, [keyInput, model, size, ratio, saveToDisk, outputDir, scope, describeFace, cred, writeKey, test, t]);
  const clearKey = (0, import_react.useCallback)(async () => {
    setSaving(true);
    await unsetKey();
    setKeyInput("");
    setDirty(false);
    setTestResult(null);
    if (cred.configured) {
      autoTestedRef.current = false;
      test();
    }
    setSaving(false);
  }, [unsetKey, cred, test]);
  const discard = (0, import_react.useCallback)(() => {
    if (!row) return;
    setModel(typeof value.defaultModel === "string" ? value.defaultModel : "gemini-3-pro-image");
    setSize(typeof value.defaultImageSize === "string" ? value.defaultImageSize : "2K");
    setRatio(typeof value.defaultAspectRatio === "string" ? value.defaultAspectRatio : "1:1");
    setSaveToDisk(value.saveToDisk === true);
    setOutputDir(typeof value.outputDir === "string" ? value.outputDir : "");
    setKeyInput("");
    setDirty(false);
    setTestResult(null);
  }, [row]);
  const mark = () => setDirty(true);
  const keySource = testResult && testResult.keyState ? testResult.keyState.source : "";
  const keySrcLabel = keySource === "credentials" ? t("keySrcCredentials") : keySource === "env" ? t("keySrcEnv") : "";
  const keyRef = testResult && testResult.keyState && testResult.keyState.ref ? testResult.keyState.ref : cred.ref || "";
  const keyMasked = testResult && testResult.keyState ? testResult.keyState.masked : "";
  const balance = testResult && testResult.ok && testResult.value ? testResult.value : null;
  const testFailed = testResult && !testResult.ok ? testResult : null;
  const freeLines = balance && Array.isArray(balance.freeUsages) ? balance.freeUsages : [];
  const expiresAt = balance && balance.subscriptionExpiresAt ? new Date(balance.subscriptionExpiresAt).toLocaleDateString() : null;
  const keyPlaceholder = keyConfigured ? t("keyPlaceholderConfigured") : t("keyEmpty");
  const keyHint = keyConfigured && !keyWritable ? t("keyReadonly") : t("keyHint") + (keyRef ? "\uFF08\u5F15\u7528 " + keyRef + "\uFF09" : "");
  const keyBadge = !keyConfigured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshln-badgeNone", children: [
    t("apiKey"),
    " \xB7 ",
    t("keyNone")
  ] }) : testResult && testResult.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshln-badgeKeyOk", children: [
    t("apiKey"),
    " \xB7 ",
    keySrcLabel || t("keySrcCredentials"),
    keyMasked ? " \xB7 " + keyMasked : "",
    " \xB7 \u2713"
  ] }) : testResult && !testResult.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshln-badgeKeyBad", children: [
    t("apiKey"),
    " \xB7 ",
    keySrcLabel || t("keySrcCredentials"),
    keyMasked ? " \xB7 " + keyMasked : "",
    " \xB7 \u2717"
  ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshln-badgeKey", children: [
    t("apiKey"),
    " \xB7 ",
    keySrcLabel || t("keySrcCredentials"),
    keyMasked ? " \xB7 " + keyMasked : ""
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "dshln-card" + (open ? " dshln-cardOpen" : ""), style: { listStyle: "none" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: "dshln-cardHeader",
        "aria-expanded": open,
        "aria-label": (open ? t("collapse") : t("expand")) + ": " + t("title"),
        onClick: () => setOpen(!open),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshln-cardHeadText", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshln-cardTitle", children: [
              t("title"),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshln-version", style: { marginLeft: 8 }, children: [
                t("version"),
                "0.3.0"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshln-desc", children: t("description") })
          ] }),
          dirty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshln-badge", children: t("unsaved") }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { className: "dshln-chevron" + (open ? " dshln-chevronOpen" : ""), width: "14", height: "14", viewBox: "0 0 14 14", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3.5 5.5L7 9l3.5-3.5", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })
        ]
      }
    ),
    open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshln-body", children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-hint", children: t("loading") }) : unavailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-testFail", children: t("unavailable") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      !writable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-hint", children: t("readonly") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshln-label", children: t("apiKey") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "dshln-input",
              type: "password",
              placeholder: keyPlaceholder,
              value: keyInput,
              autoComplete: "new-password",
              spellCheck: false,
              disabled: !writable || !keyWritable,
              onChange: (e) => {
                setKeyInput(e.target.value);
                setDirty(true);
              },
              style: { flex: 1 }
            }
          ),
          keyConfigured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshln-btn dshln-ghost", type: "button", onClick: clearKey, disabled: saving || !writable || !keyWritable, children: t("clearKey") }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-hint", children: keyHint }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }, children: [
          keyBadge,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshln-btn dshln-ghost", type: "button", onClick: test, disabled: testing || saving, children: testing ? t("testing") : keyConfigured ? t("retest") : t("test") })
        ] }),
        testing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-testing", children: t("testingLine") }) : null,
        testFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "dshln-testFail", children: [
          t("testFailLine"),
          testFailed.code ? " \xB7 [" + testFailed.code + "]" : "",
          testFailed.message ? " " + String(testFailed.message) : ""
        ] }) : null,
        balance && testResult && testResult.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-testOk", children: t("testOkLine") }) : null
      ] }),
      balance ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-balance", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          t("balanceTitle"),
          ": ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: String(balance.totalAvailableCredits ?? 0) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          t("monthly"),
          " ",
          String(balance.monthlyAvailable ?? 0),
          "/",
          String(balance.monthlyTotal ?? 0),
          " \xB7 ",
          t("permanent"),
          " ",
          String(balance.permanentAvailable ?? 0),
          " \xB7 ",
          t("limited"),
          " ",
          String(balance.limitedTimeAvailable ?? 0)
        ] }),
        freeLines.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          t("freeUsage"),
          ":",
          " ",
          freeLines.map((f) => f.unlimited ? f.resourceKey + " \u221E" : f.resourceKey + " \xD7" + String(f.remaining)).join("\uFF0C")
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          t("plan"),
          ": ",
          String(balance.plan || (balance.paidStatus ? t("paid") : t("unknown"))),
          expiresAt ? " \xB7 " + t("expires") + " " + expiresAt : "",
          balance.paidStatus ? " \xB7 " + t("paid") : "",
          balance.renewStatus ? " \xB7 " + t("renew") : ""
        ] })
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshln-label", children: t("defaultModel") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { className: "dshln-select", value: model, disabled: !writable, onChange: (e) => {
            setModel(e.target.value);
            mark();
          }, children: MODELS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: m, children: m }, m)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshln-label", children: t("defaultSize") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { className: "dshln-select", value: size, disabled: !writable, onChange: (e) => {
            setSize(e.target.value);
            mark();
          }, children: SIZES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s, children: s }, s)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshln-label", children: t("defaultRatio") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { className: "dshln-select", value: ratio, disabled: !writable, onChange: (e) => {
            setRatio(e.target.value);
            mark();
          }, children: RATIOS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: r, children: r }, r)) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "flex", alignItems: "center", gap: 6, cursor: writable ? "pointer" : "default" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "checkbox",
              checked: saveToDisk,
              disabled: !writable,
              onChange: (e) => {
                setSaveToDisk(e.target.checked);
                mark();
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshln-label", style: { margin: 0 }, children: t("saveToDisk") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-hint", children: t("saveToDiskHint") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshln-label", children: t("outputDir") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            className: "dshln-input",
            type: "text",
            value: outputDir,
            spellCheck: false,
            disabled: !writable,
            onChange: (e) => {
              setOutputDir(e.target.value);
              mark();
            }
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-footer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshln-hint", children: dirty ? t("unsaved") : "" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshln-btn dshln-ghost", type: "button", onClick: discard, disabled: saving || !writable, children: t("discard") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshln-btn dshln-save", type: "button", onClick: save, disabled: saving || !dirty || !writable, children: saving ? t("saving") : t("save") })
        ] })
      ] })
    ] }) }) : null
  ] });
}
function LabnanaToolRow(props) {
  const { t } = props;
  const { block, openFile } = props;
  const [savedState, setSavedState] = (0, import_react.useState)({});
  const done = Boolean(block && block.kind === "tool-result");
  let args = {};
  try {
    const raw = done && block.call && typeof block.call.argsRaw === "string" ? block.call.argsRaw : block && typeof block.argsRaw === "string" ? block.argsRaw : "{}";
    args = JSON.parse(raw) || {};
  } catch {
  }
  const prompt = typeof args.prompt === "string" ? args.prompt : "";
  const reqModel = typeof args.model === "string" ? args.model : "";
  const reqSize = typeof args.imageSize === "string" ? args.imageSize : "";
  const meta = done && block.meta && typeof block.meta === "object" ? block.meta : null;
  const images = meta && Array.isArray(meta.images) ? meta.images : [];
  const resModel = meta && typeof meta.model === "string" ? meta.model : reqModel;
  const resSize = meta && typeof meta.imageSize === "string" ? meta.imageSize : reqSize;
  const ratio = meta && typeof meta.aspectRatio === "string" ? meta.aspectRatio : typeof args.aspectRatio === "string" ? args.aspectRatio : "";
  const taskId = meta && typeof meta.taskId === "string" ? meta.taskId : "";
  const notSaved = meta && meta.saved !== true;
  const nameOf = (img) => {
    const url = typeof img.url === "string" ? img.url : "";
    const m = url.match(/\/api\/dsh-labnana-images\/([^/?]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  };
  const saveToProject = async (img) => {
    const name = nameOf(img);
    if (!name || savedState[name]) return;
    setSavedState((s) => ({ ...s, [name]: "saving" }));
    try {
      const response = await fetch("/api/dsh-labnana-images/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name })
      });
      const json = await response.json();
      setSavedState((s) => ({ ...s, [name]: json && json.ok ? "saved" : "" }));
    } catch {
      setSavedState((s) => ({ ...s, [name]: "" }));
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-tool", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-toolHead", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshln-toolTitle", children: done && block.isError ? t("toolTitleError") : t("toolTitle") }),
      resModel || reqModel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshln-toolBadge", children: [resModel || reqModel, resSize || reqSize, ratio].filter(Boolean).join(" \xB7 ") }) : null,
      taskId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshln-toolMeta", children: [
        t("toolTaskId"),
        taskId
      ] }) : null
    ] }),
    !done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-toolRun", children: prompt ? t("toolRunningWith") + prompt : t("toolRunning") }) : block.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-toolErr", children: (block.error && block.error.code ? "[" + block.error.code + "] " : "") + (Array.isArray(block.content) ? block.content.filter((c) => c && c.type === "text" && typeof c.text === "string").map((c) => c.text).join("\n") : "") || t("toolTitleError") }) : images.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-toolRun", children: t("toolNoImages") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshln-toolGrid", children: images.map((img, i) => {
        const url = typeof img.url === "string" ? img.url : "";
        const path = typeof img.path === "string" ? img.path : "";
        const imgEl = url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "img",
          {
            className: "dshln-toolImg " + (images.length === 1 ? "dshln-toolImgSingle" : "dshln-toolImgMulti"),
            src: url,
            alt: path || "labnana-" + i,
            loading: "lazy",
            onClick: () => {
              const win = window.open(url, "_blank");
              if (win) win.focus();
            }
          }
        ) : null;
        if (!url || !path) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", { children: imgEl }, i);
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { style: { margin: 0, flex: images.length === 1 ? "1 1 100%" : "1 1 calc(50% - 4px)", minWidth: 0 }, children: [
          imgEl,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { className: "dshln-toolPath", children: path })
        ] }, i);
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-toolActions", children: [
        images.map((img, i) => {
          const path = typeof img.path === "string" ? img.path : "";
          if (!path) return null;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "dshln-toolLink", type: "button", onClick: () => {
            if (typeof openFile === "function") openFile(path);
          }, children: [
            t("toolOpenFile"),
            " ",
            i + 1
          ] }, i);
        }),
        notSaved ? images.map((img, i) => {
          const name = nameOf(img);
          if (!name) return null;
          const state = savedState[name];
          const label = state === "saved" ? t("savedToProject") : state === "saving" ? t("savingToProject") : t("saveToProject") + (images.length > 1 ? " " + (i + 1) : "");
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshln-toolLink", type: "button", onClick: () => saveToProject(img), disabled: Boolean(state), children: label }, "save" + i);
        }) : null,
        prompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshln-toolMeta", children: prompt }) : null
      ] })
    ] })
  ] });
}
var inject = ["slots", "settingsScope", "connection", "remote", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register("labnana", { zh: I18N.zh, en: I18N.en }), "dsh-labnana: locale dictionary");
  const scope = ctx.settingsScope.bind({ namespace: NS });
  const describeFace = ctx.settingsScope.describe();
  const { api } = ctx.get("connection");
  const DEFAULT_API_KEY_REF = "LABNANA_API_KEY";
  const refOf = () => {
    const row = rowOf(describeFace.getSnapshot());
    const declared = row && row.value && typeof row.value.apiKeyEnv === "string" ? row.value.apiKeyEnv : "";
    return declared.length > 0 ? declared : DEFAULT_API_KEY_REF;
  };
  const credentialStore = { ref: "", configured: false, writable: true };
  const credentialListeners = /* @__PURE__ */ new Set();
  const notifyCredential = () => {
    for (const listener of credentialListeners) listener(credentialStore);
  };
  async function readCredential() {
    const ref = refOf();
    if (ref !== credentialStore.ref) {
      credentialStore.ref = ref;
      credentialStore.configured = false;
      notifyCredential();
    }
    let response;
    try {
      response = await api.credentials.describe({ refs: [ref] });
    } catch (_credentialReadFailure) {
      return;
    }
    if (!response || !response.result || !response.result.ok || ref !== refOf()) return;
    const view = response.result.value.credentials[ref] ?? {};
    const next = { ref, configured: view.configured === true, writable: view.writable !== false };
    if (next.configured === credentialStore.configured && next.writable === credentialStore.writable) return;
    credentialStore.ref = next.ref;
    credentialStore.configured = next.configured;
    credentialStore.writable = next.writable;
    notifyCredential();
  }
  async function writeKey(value) {
    try {
      await api.credentials.set({ ref: refOf(), value });
    } catch (_credentialWriteFailure) {
    }
    await readCredential();
    return credentialStore.configured;
  }
  async function unsetKey() {
    try {
      await api.credentials.unset({ ref: refOf() });
    } catch (_credentialWriteFailure) {
    }
    await readCredential();
  }
  ctx.effect(() => ctx.remote.$on("credentials/reference-updated", (ref) => {
    if (typeof ref === "string" && ref === credentialStore.ref) readCredential();
  }), "dsh-labnana: credentials/reference-updated");
  readCredential();
  const subscribeCredential = (listener) => {
    credentialListeners.add(listener);
    return () => credentialListeners.delete(listener);
  };
  const cardProps = { scope, describeFace, credential: credentialStore, subscribeCredential, writeKey, unsetKey };
  ctx.slots.inject(
    "settings.plugin.item",
    () => ctx.slots.register(
      {
        name: "settings.plugin.item",
        key: "labnana",
        id: "dsh-labnana",
        order: 130,
        locale: "labnana",
        inject: () => ({})
      },
      (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabnanaCard, { ...props, ...cardProps })
    )
  );
  ctx.slots.inject(
    "tool.call.toolview",
    () => ctx.slots.register(
      {
        name: "tool.call.toolview",
        key: "labnana_generate_image",
        id: "dsh-labnana",
        locale: "labnana"
      },
      LabnanaToolRow
    )
  );
}

    return module.exports;
  },
});
