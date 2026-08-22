// dsh-labnana 构建脚本：host ESM + client lazy-CJS factory bundle
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lib = path.join(root, "lib");

// host 端：Node ESM，运行时依赖全部 external（走安装树唯一实例）
await build({
  entryPoints: [path.join(root, "src/host/index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: path.join(lib, "index.js"),
  external: ["@deepseek-ai/*", "node:*"],
  sourcemap: false,
  logLevel: "info",
});

// client 端：CJS bundle（react 等 external → 注入 require），
// 然后包进 __ModuleLoader__.load 的 lazy-CJS factory（官方产物形态）
const client = await build({
  entryPoints: [path.join(root, "src/client/entry.ts")],
  bundle: true,
  platform: "browser",
  format: "cjs",
  target: "es2020",
  jsx: "automatic",
  external: ["react", "react/jsx-runtime"],
  write: false,
  logLevel: "info",
});

const bundle = client.outputFiles[0].text;
const wrapped = [
  `window.__ModuleLoader__.load({`,
  `  id: "dsh-labnana",`,
  `  factory: (require) => {`,
  `    var module = { exports: {} };`,
  `    var exports = module.exports;`,
  bundle,
  `    return module.exports;`,
  `  },`,
  `});`,
  ``,
].join("\n");
fs.mkdirSync(lib, { recursive: true });
fs.writeFileSync(path.join(lib, "client.js"), wrapped);
console.log("built: lib/index.js (host ESM) + lib/client.js (client lazy-CJS factory)");
