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
const apiRequests = [];
const imageUrl = "https://images.example/mock.png";
globalThis.fetch = async (url, init = {}) => {
  const requestUrl = new URL(typeof url === "string" ? url : url.url);
  if (requestUrl.pathname === "/openapi/v1/user/subscription") {
    requestedKeys.push(init.headers.Authorization);
    return Response.json({ code: 0, data: { totalAvailableCredits: 12 } });
  }
  if (requestUrl.hostname === "api.labnana.com") {
    const request = { path: requestUrl.pathname, method: init.method ?? "GET", body: init.body ? JSON.parse(init.body) : undefined };
    apiRequests.push(request);
    if (request.path === "/openapi/v1/images/generation/estimate-credits") {
      return Response.json({ code: 0, data: { credits: 7, canGenerate: true } });
    }
    if (request.path === "/openapi/v1/images/generation") {
      return Response.json({ code: 0, data: { candidates: [{ content: { parts: [{ inlineData: { data: "AQID", mimeType: "image/png" } }] } }] } });
    }
    if (request.path === "/openapi/v1/images/generation/async") {
      return Response.json({ code: 0, data: { taskId: "mock-task" } });
    }
    if (request.path === "/openapi/v1/images/generation/tasks/mock-task") {
      return Response.json({ code: 0, data: { status: "success", images: [{ url: imageUrl, mimeType: "image/png" }] } });
    }
  }
  if (requestUrl.href === imageUrl) return new Response(Buffer.from([1, 2, 3]), { headers: { "content-type": "image/png" } });
  throw new Error(`Unexpected mocked request: ${requestUrl.href}`);
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

  const signal = new AbortController().signal;
  const estimate = registeredTools.get("labnana_estimate_credits");
  const references = Array.from({ length: 4 }, (_, i) => ({ url: `https://refs.example/${i}.png` }));
  for (const [model, aspectRatio] of [["gpt-image-2.5-flare", "4:5"], ["gpt-image-2.5-sunburst", "5:4"]]) {
    for (const imageSize of ["1K", "2K", "4K"]) {
      const result = await estimate.execute({ prompt: "mock estimate", model, imageSize, aspectRatio, referenceImages: references }, { signal });
      assert.equal(result.credits, 7);
      const request = apiRequests.at(-1);
      assert.equal(request.path, "/openapi/v1/images/generation/estimate-credits");
      assert.equal(request.body.provider, "openai");
      assert.equal(request.body.model, model);
      assert.equal(request.body.imageConfig.imageSize, imageSize);
      assert.equal(request.body.imageConfig.aspectRatio, aspectRatio);
      assert.equal(request.body.referenceImages.length, 4);
    }
  }
  const requestCount = apiRequests.length;
  await assert.rejects(estimate.execute({ prompt: "mock estimate", model: "gpt-image-2.5-flare", aspectRatio: "1:4" }, { signal }), /不支持宽高比/);
  await assert.rejects(estimate.execute({ prompt: "mock estimate", model: "gpt-image-2.5-sunburst", referenceImages: [...references, { url: "https://refs.example/5.png" }] }, { signal }), /最多支持 4 张参考图/);
  assert.equal(apiRequests.length, requestCount, "invalid ratio/reference count must fail before an API request");
  const legacy = await estimate.execute({ prompt: "legacy ratio", model: "gpt-image-2", imageSize: "2K", aspectRatio: "1:4" }, { signal });
  assert.equal(legacy.model, "gpt-image-2", "existing model ratios remain unchanged");

  const generate = registeredTools.get("labnana_generate_image");
  const generatedSunburst = await generate.execute({ prompt: "mock 2K", model: "gpt-image-2.5-sunburst", imageSize: "2K", aspectRatio: "5:4", referenceImages: references, outputMode: "inline" }, { signal });
  assert.equal(generatedSunburst.ok, true);
  assert.equal(generatedSunburst.images[0].data, "AQID");
  assert.match(generatedSunburst.images[0].url, /^\/api\/dsh-labnana-images\//, "inline result exposes a preview URL for the conversation card");
  assert.equal(generate.output.presentationMeta({}, generatedSunburst).images[0].url, generatedSunburst.images[0].url, "conversation card metadata retains the inline image preview URL");
  let imageStatus, imageBytes;
  await routes.get("/api/dsh-labnana-images")({ url: generatedSunburst.images[0].url, socket: { remoteAddress: "127.0.0.1" } }, {
    writeHead(status) { imageStatus = status; },
    end(bytes) { imageBytes = bytes; },
  });
  assert.equal(imageStatus, 200, "conversation card preview URL serves the in-memory image");
  assert.deepEqual([...imageBytes], [1, 2, 3]);
  assert.ok(apiRequests.some(({ path, body }) => path === "/openapi/v1/images/generation" && body.model === "gpt-image-2.5-sunburst" && body.provider === "openai" && body.referenceImages.length === 4), "Sunburst uses the OpenAI sync payload and accepts four references");

  const syncGenerationCount = apiRequests.filter(({ path }) => path === "/openapi/v1/images/generation").length;
  const generated = await generate.execute({ prompt: "mock 4K", model: "gpt-image-2.5-flare", imageSize: "4K", aspectRatio: "16:9", outputMode: "inline", waitSeconds: 10 }, { signal });
  assert.equal(generated.ok, true);
  assert.equal(generated.taskId, "mock-task");
  assert.equal(generated.images[0].data, Buffer.from([1, 2, 3]).toString("base64"));
  assert.match(generated.images[0].url, /^\/api\/dsh-labnana-images\//, "async inline result exposes a preview URL for the conversation card");
  assert.ok(apiRequests.some(({ path, body }) => path === "/openapi/v1/images/generation/async" && body.model === "gpt-image-2.5-flare" && body.provider === "openai"), "4K generation uses the async endpoint");
  assert.ok(apiRequests.some(({ path }) => path === "/openapi/v1/images/generation/tasks/mock-task"), "async task is polled");
  assert.equal(apiRequests.filter(({ path }) => path === "/openapi/v1/images/generation").length, syncGenerationCount, "mock 4K check makes no synchronous generation request");

  console.log("connection: credentials, GPT-Image-2.5 estimates/limits, sync/async generation, and inline image previews passed");
} finally {
  globalThis.fetch = originalFetch;
  await host.dispose();
  assert.equal(registeredTools.size, 0);
}
