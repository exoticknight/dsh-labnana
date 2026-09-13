import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { Context } from "@deepseek-ai/cordis";
import * as plugin from "../lib/index.js";

const ctx = new Context();
const routes = new Map();
const registeredTools = new Map();
ctx.provide("tools", { register(tool) { registeredTools.set(tool.name, tool); return () => registeredTools.delete(tool.name); } });
let savedKey;
ctx.provide("credentials", { resolve: async () => ({ value: savedKey }) });
ctx.provide("webServer", { register(route) { routes.set(route.path, route.handler); return () => {}; } });
const host = await ctx.plugin(plugin, {});
await new Promise((resolve) => setImmediate(resolve));
const handler = routes.get("/api/dsh-labnana-settings/test");
assert.equal(typeof handler, "function");
assert.deepEqual([...registeredTools.keys()].sort(), ["labnana_estimate_credits", "labnana_generate_image", "labnana_get_subscription", "labnana_get_task"]);
const originalFetch = globalThis.fetch;
const requestedKeys = [];
globalThis.fetch = async (url, init) => {
  assert.equal(url, "https://api.labnana.com/openapi/v1/user/subscription");
  requestedKeys.push(init.headers.Authorization);
  return Response.json({ code: 0, data: { totalAvailableCredits: 12 } });
};
async function request(body) {
  const raw = body === undefined ? "" : JSON.stringify(body);
  const req = Readable.from(raw ? [Buffer.from(raw)] : []);
  Object.assign(req, { method: "POST", socket: { remoteAddress: "127.0.0.1" }, headers: { host: "localhost", "content-length": Buffer.byteLength(raw) } });
  let status, result;
  await handler(req, { writeHead(value) { status = value; }, end(value) { result = JSON.parse(value); } });
  return { status, result };
}
try {
  assert.equal((await request({ apiKey: " draft-test-key " })).result.ok, true);
  assert.equal(requestedKeys.pop(), "Bearer draft-test-key");
  assert.equal(savedKey, undefined);
  savedKey = "stored-test-key";
  const subscription = await registeredTools.get("labnana_get_subscription").execute({}, {});
  assert.equal(subscription.totalAvailableCredits, 12);
  assert.equal(requestedKeys.pop(), "Bearer stored-test-key");
  assert.equal((await request({ apiKey: "replacement-test-key" })).result.ok, true);
  assert.equal(requestedKeys.pop(), "Bearer replacement-test-key");
  assert.equal(savedKey, "stored-test-key");
  for (const body of [undefined, {}, { apiKey: " " }]) {
    assert.equal((await request(body)).result.ok, true);
    assert.equal(requestedKeys.pop(), "Bearer stored-test-key");
  }
  assert.equal((await request({ apiKey: 123 })).status, 400);
  assert.equal((await request(null)).status, 400);
  console.log("connection: draft key, replacement, saved-key fallback and invalid requests passed");
} finally {
  globalThis.fetch = originalFetch;
  await host.dispose();
  assert.equal(registeredTools.size, 0);
}
