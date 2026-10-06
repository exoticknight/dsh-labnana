import assert from "node:assert/strict";
import { Context } from "@deepseek-ai/cordis";
import * as plugin from "../lib/index.js";

const settingsModule = await import(process.argv[2] ?? "@deepseek-ai/dsh-settings");
const tick = () => new Promise((resolve) => setImmediate(resolve));

async function checkLegacyProvider(SettingsProvider) {
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
}

async function checkSettingsForms() {
  const { SettingsForms } = settingsModule;
  assert.equal(typeof SettingsForms?.prototype?.configure, "function");
  const ctx = new Context();
  let prompt = "";
  let sectionCalls = 0;
  let configureCalls = 0;
  let disposeCalls = 0;
  ctx.provide("systemPrompt", {
    section({ text }) { prompt = text; sectionCalls++; return () => { prompt = ""; }; },
  });
  ctx.provide("settings", {
    configure(presentation, owner) {
      assert.deepEqual(presentation, { auto: false });
      assert.ok(owner);
      configureCalls++;
      return () => { disposeCalls++; };
    },
  });
  const host = await ctx.plugin(plugin, { defaultModel: "wan2.7-image" });
  await tick();
  assert.equal(configureCalls, 1);
  assert.equal(sectionCalls, 1);
  assert.match(prompt, /Current defaults: model=wan2\.7-image\b/);
  ctx.emit("settings/document-updated", "dsh-labnana");
  await tick();
  assert.equal(sectionCalls, 2);
  assert.match(prompt, /Current defaults: model=wan2\.7-image\b/);
  await host.dispose();
  assert.equal(prompt, "");
  assert.equal(disposeCalls, 1);
}

if (typeof settingsModule.SettingsProvider === "function") {
  await checkLegacyProvider(settingsModule.SettingsProvider);
  console.log("settings: legacy provider import, updates, fallback and cleanup passed");
} else {
  await checkSettingsForms();
  console.log("settings: DSH 0.2 SettingsForms configuration, refresh and cleanup passed");
}
