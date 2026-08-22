// 客户端 bundle 入口：CJS 产物由 scripts/build.mjs 包进
// window.__ModuleLoader__.load({ id, factory }) 的 lazy-CJS factory。
// react / react/jsx-runtime 等 external 走 factory 注入的 require（模块表）。
export { apply, inject } from "./index.js";
