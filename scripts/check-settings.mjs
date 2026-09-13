// Exercise the shipped host against a real settings provider; no API calls or disk writes.
import assert from "node:assert/strict";
import { Context } from "@deepseek-ai/cordis";
import * as plugin from "../lib/index.js";

const { SettingsProvider } = await import(process.argv[2] ?? "@deepseek-ai/dsh-settings");
class MemorySettings extends SettingsProvider {
  writable = true;
  async load() { return { labnana: { defaultModel: "gpt-image-2" } }; }
  async persist() {}
}

const ctx = new Context();
let prompt = "";
ctx.provide("systemPrompt", {
  section({ text }) { prompt = text; return () => { prompt = ""; }; },
});
const tick = () => new Promise((resolve) => setImmediate(resolve));
const host = await ctx.plugin(plugin, { defaultModel: "wan2.7-image" });
await tick();
assert.match(prompt, /Current defaults: model=wan2\.7-image\b/);
const provider = await ctx.plugin(MemorySettings);
await tick();
assert.equal(ctx.settings.get("labnana").defaultModel, "gpt-image-2");
assert.match(prompt, /Current defaults: model=gpt-image-2\b/);
await ctx.settings.update("labnana", { defaultModel: "seedream-5-0-pro" });
await tick();
assert.match(prompt, /Current defaults: model=seedream-5-0-pro\b/);
await provider.dispose();
await tick();
assert.match(prompt, /Current defaults: model=wan2\.7-image\b/);
const replacement = await ctx.plugin(MemorySettings);
await tick();
assert.match(prompt, /Current defaults: model=gpt-image-2\b/);
await host.dispose();
assert.equal(ctx.settings.get("labnana"), undefined);
await replacement.dispose();
console.log("settings: host import, late attach, live update, fallback, reattach and cleanup passed");
