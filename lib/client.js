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
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/official/PluginCard.css
var PluginCard_default = "/* From @deepseek-ai/dsh-client-ui-settings-plugins 0.1.5-rc.2, MIT.\n * Original PluginCard.module.css; only class names are scoped to dshln-.\n * See LICENSE. */\n.dshln-card{border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-3);border-radius:16px;list-style:none;transition:border-color .16s,background .16s}.dshln-card:hover{border-color:var(--dsw-alias-label-dimmed)}.dshln-cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}.dshln-cardHeader{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}.dshln-cardHeader:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.dshln-cardHeadText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.dshln-cardTitle{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.dshln-desc{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}.dshln-chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.dshln-chevronOpen{transform:rotate(180deg)}.dshln-body{border-top:.5px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}.dshln-readOnly{color:var(--dsw-alias-label-tertiary);margin:12px 0 0;font-size:12px;line-height:1.5}.dshln-pending{flex:none}.dshln-footer{border-top:.5px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}.dshln-failed{min-width:0;color:var(--dsw-alias-label-error);flex:1;margin:0;font-size:12px;line-height:1.5}.dshln-discardAction,.dshln-saveAction{appearance:none;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}.dshln-discardAction{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:0 0}.dshln-discardAction:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}.dshln-saveAction{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}.dshln-discardAction:disabled,.dshln-saveAction:disabled{opacity:.4;cursor:default}.dshln-discardAction:focus-visible,.dshln-saveAction:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}\n";

// src/client/official/fields.css
var fields_default = "/* From @deepseek-ai/dsh-client-ui-settings-plugins 0.1.5-rc.2, MIT.\n * Original fields.module.css; only class names are scoped to dshln-.\n * See LICENSE. */\n.dshln-field{flex-direction:column;gap:6px;padding:12px 0;display:flex}.dshln-field+.dshln-field{border-top:.5px solid var(--dsw-alias-border-l2)}.dshln-fieldHead{align-items:center;gap:8px;display:flex}.dshln-label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}.dshln-fieldBadges{align-items:center;gap:8px;display:inline-flex}.dshln-fieldReset{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;padding:0;font-size:12px;line-height:1.5}.dshln-fieldReset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.dshln-fieldReset:disabled{cursor:default}.dshln-input{border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.dshln-input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.dshln-input:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.dshln-inputInvalid{border-color:var(--dsw-alias-label-error);}.dshln-invalid{color:var(--dsw-alias-label-error);margin:0;font-size:12px;line-height:1.5}.dshln-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}\n";

// src/client/settings.ts
function unwrap(result) {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}
function createCredentials(remote, refOf) {
  let state = { ref: refOf(), configured: false, writable: false };
  let generation = 0;
  let disposed = false;
  const listeners = /* @__PURE__ */ new Set();
  const publish = (next) => {
    state = next;
    for (const listener of listeners) listener(state);
  };
  async function refresh() {
    const ref = refOf();
    const read = ++generation;
    try {
      const values = unwrap(await remote.describe([ref]));
      const value = values[ref];
      const next = { ref, configured: value?.configured ?? false, writable: value?.writable ?? false };
      if (!disposed && read === generation && ref === refOf()) publish(next);
      return next;
    } catch (error) {
      const next = { ...state, ref, error: error instanceof Error ? error.message : String(error) };
      if (!disposed && read === generation && ref === refOf()) publish(next);
      return next;
    }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => {
        listeners.delete(listener);
      };
    },
    refresh,
    async write(value) {
      unwrap(await remote.set(refOf(), value));
      const next = await refresh();
      if (next.error || !next.configured) throw new Error(next.error ?? "Credential could not be read back after saving.");
      return true;
    },
    async clear() {
      unwrap(await remote.unset(refOf()));
      const next = await refresh();
      if (next.error) throw new Error(next.error);
    },
    dispose() {
      disposed = true;
      generation++;
      listeners.clear();
    }
  };
}
async function saveFields(scope, fields) {
  const before = scope.getSnapshot();
  if (!before.writable) throw new Error("Settings are read-only.");
  const changed = fields.filter(([field, value]) => before.value?.[field] !== value);
  if (!changed.length) return;
  await scope.mutate(changed.map(([field, value]) => ({ op: "set", path: [field], value })), before.revision);
  const after = scope.getSnapshot();
  const failed = changed.filter(([field, value]) => after.value?.[field] !== value);
  if (failed.length) throw new Error(`Settings were not saved: ${failed.map(([field]) => field).join(", ")}`);
}

// src/client/index.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var css = [
  PluginCard_default,
  fields_default,
  ".dshln-chevron{display:inline-flex;font-size:20px;line-height:1}",
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
  ".dshln-pageForm{width:100%;min-width:0}",
  ".dshln-pageForm .dshln-input:not([type=checkbox]){box-sizing:border-box;min-width:0;width:100%}",
  ".dshln-pageBody{padding-bottom:8px}",
  ".dshln-pageBody .dshln-footer{justify-content:flex-start}",
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
  ".dshln-testFail{color:var(--dsw-alias-label-error)}.dshln-testOk{color:var(--dsw-alias-label-primary)}"
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
var LEGACY_SETTINGS_NS = "labnana";
var CONFIG_FORM_NS = "dsh-labnana";
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
var sizesFor = (model) => model === "wan2.7-image" || model === "seedream-5-0-pro" ? SIZES.slice(0, 2) : SIZES;
var RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9", "1:4", "4:1", "1:8", "8:1"];
var I18N = {
  zh: {
    title: "Labnana \u56FE\u7247\u751F\u6210",
    saved: "\u5DF2\u4FDD\u5B58",
    description: "Labnana \u56FE\u7247\u751F\u6210 \u2014\u2014 \u6587\u751F\u56FE / \u56FE\u751F\u56FE / \u7CBE\u51C6\u7F16\u8F91\uFF08Gemini \xB7 GPT-Image-2 \xB7 Wan2.7 \xB7 Seedream\uFF09",
    expand: "\u5C55\u5F00\u8BBE\u7F6E",
    collapse: "\u6536\u8D77\u8BBE\u7F6E",
    apiKey: "API Key",
    keyEmpty: "lh_\u2026 \u5728 labnana.com/api-keys \u521B\u5EFA",
    keyPlaceholderConfigured: "\u5DF2\u914D\u7F6E \xB7 \u8F93\u5165\u65B0\u503C\u53EF\u66FF\u6362",
    keySrcCredentials: "\u51ED\u636E\u57DF",
    keySrcEnv: "\u73AF\u5883\u53D8\u91CF",
    keyNone: "\u672A\u914D\u7F6E",
    keyHint: "\u8F93\u5165 Key \u540E\u53EF\u5148\u6D4B\u8BD5\u8FDE\u63A5\uFF0C\u70B9\u51FB\u4FDD\u5B58\u540E\u751F\u6548\u3002\u7559\u7A7A\u4FDD\u7559\u5DF2\u4FDD\u5B58\u7684 Key\u3002",
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
    discard: "\u653E\u5F03\u4FEE\u6539",
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
    saved: "Saved",
    description: "Labnana image generation \u2014 text-to-image / image-to-image / precise editing (Gemini \xB7 GPT-Image-2 \xB7 Wan2.7 \xB7 Seedream)",
    expand: "Show settings",
    collapse: "Hide settings",
    apiKey: "API Key",
    keyEmpty: "lh_\u2026 create one at labnana.com/api-keys",
    keyPlaceholderConfigured: "configured \u2014 type to replace",
    keySrcCredentials: "credentials",
    keySrcEnv: "env",
    keyNone: "not configured",
    keyHint: "Test the entered key before saving. Save applies it; leave blank to keep the saved key.",
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
    discard: "Discard changes",
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
async function bridgeTest(apiKey) {
  try {
    const response = await fetch(TEST_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(apiKey ? { apiKey } : {})
    });
    const json = await response.json();
    return json;
  } catch (error) {
    return { ok: false, code: "network", message: String(error && error.message ? error.message : error) };
  }
}
function rowOf(viewSnapshot, namespace) {
  const namespaces = viewSnapshot?.view && Array.isArray(viewSnapshot.view.namespaces) ? viewSnapshot.view.namespaces : [];
  return namespaces.find((candidate) => candidate.ns === namespace) ?? null;
}
function LabnanaCard(props) {
  if (props.view === "summary") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: props.t("description") });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabnanaSettingsCard, { ...props });
}
function LabnanaSettingsCard(props) {
  const t = props.t;
  const { scope, describeFace, credential, subscribeCredential, writeKey, unsetKey } = props;
  const [view, setView] = (0, import_react.useState)(() => describeFace.getSnapshot());
  const [cred, setCred] = (0, import_react.useState)(credential);
  const [dirty, setDirty] = (0, import_react.useState)(false);
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [testing, setTesting] = (0, import_react.useState)(false);
  const [testResult, setTestResult] = (0, import_react.useState)(null);
  const [saveError, setSaveError] = (0, import_react.useState)("");
  const [saved, setSaved] = (0, import_react.useState)(false);
  const [keyInput, setKeyInput] = (0, import_react.useState)("");
  const [model, setModel] = (0, import_react.useState)("");
  const [size, setSize] = (0, import_react.useState)("");
  const [ratio, setRatio] = (0, import_react.useState)("");
  const [saveToDisk, setSaveToDisk] = (0, import_react.useState)(false);
  const [outputDir, setOutputDir] = (0, import_react.useState)("");
  const [open, setOpen] = (0, import_react.useState)(false);
  const page = props.view === "page";
  const expanded = page || open;
  const autoTestedRef = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => describeFace.subscribe(() => setView(describeFace.getSnapshot())), [describeFace]);
  (0, import_react.useEffect)(() => subscribeCredential((state) => setCred({ ...state })), [subscribeCredential]);
  const row = rowOf(view, props.namespace);
  const value = row && row.value || {};
  const user = row && row.user || {};
  const loading = !view || !view.view;
  const unavailable = !loading && row === null;
  const writable = view && view.view ? view.view.writable !== false : false;
  const keyConfigured = cred.configured === true;
  const keyWritable = cred.writable !== false;
  (0, import_react.useEffect)(() => {
    if (!row || dirty) return;
    setModel(typeof value.defaultModel === "string" ? value.defaultModel : "gemini-3-pro-image");
    setSize(typeof value.defaultImageSize === "string" ? value.defaultImageSize : "2K");
    setRatio(typeof value.defaultAspectRatio === "string" ? value.defaultAspectRatio : "1:1");
    setSaveToDisk(value.saveToDisk === true);
    setOutputDir(typeof value.outputDir === "string" ? value.outputDir : "");
    setKeyInput("");
    setDirty(false);
  }, [view, dirty]);
  const test = (0, import_react.useCallback)(async (apiKey) => {
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
  (0, import_react.useEffect)(() => {
    if (expanded && keyConfigured && !saving && !keyInput && !autoTestedRef.current) {
      autoTestedRef.current = true;
      test();
    }
  }, [expanded, keyConfigured, saving, keyInput, test]);
  const save = (0, import_react.useCallback)(async () => {
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      if (keyInput.trim()) {
        await writeKey(keyInput.trim());
        setKeyInput("");
      }
      const fields = [
        ["defaultModel", model],
        ["defaultImageSize", size],
        ["defaultAspectRatio", ratio],
        ["saveToDisk", saveToDisk],
        ["outputDir", outputDir]
      ];
      await saveFields(scope, fields);
      setDirty(false);
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }, [keyInput, model, size, ratio, saveToDisk, outputDir, scope, writeKey]);
  const clearKey = (0, import_react.useCallback)(async () => {
    setSaving(true);
    setSaveError("");
    try {
      await unsetKey();
      setKeyInput("");
      setTestResult(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }, [unsetKey]);
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
    setSaveError("");
    setSaved(false);
  }, [row]);
  const mark = () => {
    setDirty(true);
    setSaved(false);
    setSaveError("");
  };
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
  const Root = page ? "div" : "li";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    Root,
    {
      className: page ? "dshln-pageForm" : "dshln-card" + (open ? " dshln-cardOpen" : ""),
      style: page ? void 0 : { listStyle: "none" },
      children: [
        !page ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
                    "0.3.4"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshln-desc", children: t("description") })
              ] }),
              dirty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshln-badge", children: t("unsaved") }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", className: "dshln-chevron" + (open ? " dshln-chevronOpen" : ""), children: "\u2304" })
            ]
          }
        ) : null,
        expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: page ? "dshln-pageBody" : "dshln-body", children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-hint", children: t("loading") }) : unavailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-testFail", children: t("unavailable") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          !writable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-hint", children: t("readonly") }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshln-label", children: t("apiKey") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  "aria-label": t("apiKey"),
                  className: "dshln-input",
                  type: "password",
                  placeholder: keyPlaceholder,
                  value: keyInput,
                  autoComplete: "new-password",
                  spellCheck: false,
                  disabled: saving || testing || !keyWritable,
                  onChange: (e) => {
                    setKeyInput(e.target.value);
                    mark();
                    setTestResult(null);
                  },
                  style: { flex: 1 }
                }
              ),
              keyConfigured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", size: "sm", type: "button", onClick: clearKey, disabled: saving || testing || !keyWritable, children: t("clearKey") }) : null
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshln-hint", children: keyHint }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }, children: [
              keyBadge,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", size: "sm", type: "button", onClick: () => test(keyInput.trim()), disabled: testing || saving, children: testing ? t("testing") : keyConfigured ? t("retest") : t("test") })
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshln-label", children: t("defaultModel") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": t("defaultModel"), className: "dshln-input", value: model, disabled: saving || testing || !writable, onChange: (e) => {
                setModel(e.target.value);
                if (!sizesFor(e.target.value).includes(size)) setSize("2K");
                mark();
              }, children: MODELS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: m, children: m }, m)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshln-label", children: t("defaultSize") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": t("defaultSize"), className: "dshln-input", value: size, disabled: saving || testing || !writable, onChange: (e) => {
                setSize(e.target.value);
                mark();
              }, children: sizesFor(model).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s, children: s }, s)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshln-label", children: t("defaultRatio") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": t("defaultRatio"), className: "dshln-input", value: ratio, disabled: saving || testing || !writable, onChange: (e) => {
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
                  disabled: saving || testing || !writable,
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
                "aria-label": t("outputDir"),
                className: "dshln-input",
                type: "text",
                value: outputDir,
                spellCheck: false,
                disabled: saving || testing || !writable,
                onChange: (e) => {
                  setOutputDir(e.target.value);
                  mark();
                }
              }
            )
          ] }),
          saveError || cred.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { role: "alert", className: "dshln-testFail", children: [
            t("saveFailed"),
            " ",
            saveError || cred.error
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshln-footer", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { role: "status", className: "dshln-hint", style: { marginRight: page ? 0 : "auto" }, children: dirty ? t("unsaved") : saved ? t("saved") : "" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
              !page ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshln-discardAction", type: "button", onClick: discard, disabled: saving || testing || !dirty || !writable, children: t("discard") }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshln-saveAction", type: "button", onClick: save, disabled: saving || testing || !dirty || !writable, children: saving ? t("saving") : t("save") })
            ] })
          ] })
        ] }) }) : null
      ]
    }
  );
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
var inject = ["slots", "remote", "remote.credentials", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register("labnana", { zh: I18N.zh, en: I18N.en }), "dsh-labnana: locale dictionary");
  const configForms = ctx.get("configForms", false);
  const legacySettingsScope = ctx.get("settingsScope", false);
  const useConfigForms = Boolean(configForms && typeof configForms.get === "function" && typeof configForms.whileServed === "function");
  const settingsNamespace = useConfigForms ? CONFIG_FORM_NS : LEGACY_SETTINGS_NS;
  const settingsApi = useConfigForms ? configForms : legacySettingsScope;
  if (!settingsApi) {
    ctx.logger?.warn?.("dsh-labnana: no supported client settings API is available");
    return;
  }
  const scope = useConfigForms ? configForms.get(settingsNamespace) : legacySettingsScope.bind({ namespace: settingsNamespace });
  const describeFace = useConfigForms ? configForms.describe() : legacySettingsScope.describe();
  const DEFAULT_API_KEY_REF = "LABNANA_API_KEY";
  const refOf = () => {
    const row = rowOf(describeFace.getSnapshot(), settingsNamespace);
    const declared = row && row.value && typeof row.value.apiKeyEnv === "string" ? row.value.apiKeyEnv : "";
    return declared.length > 0 ? declared : DEFAULT_API_KEY_REF;
  };
  const credentials = createCredentials(ctx.remote.credentials, refOf);
  const readCredential = () => credentials.refresh();
  ctx.effect(() => ctx.remote.$on("credentials/reference-updated", (ref) => {
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
  const cardProps = { namespace: settingsNamespace, scope, describeFace, credential: credentialStore, subscribeCredential, writeKey, unsetKey };
  if (useConfigForms) {
    ctx.effect(() => configForms.whileServed(
      [settingsNamespace],
      () => ctx.slots.inject(
        "plugins.bundle.config",
        () => ctx.slots.register(
          {
            name: "plugins.bundle.config",
            key: "dsh-labnana",
            locale: NS,
            inject: () => ({})
          },
          (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabnanaCard, { ...props, ...cardProps })
        )
      )
    ), "dsh-labnana: config form page");
  } else {
    ctx.effect(() => ctx.slots.inject(
      "settings.plugin.item",
      () => ctx.slots.register(
        {
          name: "settings.plugin.item",
          key: "labnana",
          id: "dsh-labnana",
          order: 130,
          locale: NS,
          inject: () => ({})
        },
        (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabnanaCard, { ...props, ...cardProps })
      )
    ), "dsh-labnana: legacy settings card");
  }
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
