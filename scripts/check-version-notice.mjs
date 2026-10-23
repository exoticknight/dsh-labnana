import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { transform } from "esbuild";

const source = await fs.readFile(new URL("../src/client/version-notice.ts", import.meta.url), "utf8");
const { code } = await transform(source, { loader: "ts", format: "esm", target: "node20" });
let moduleId = 0;
const load = () => import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}#${moduleId++}`);
const flush = () => new Promise(resolve => setImmediate(resolve));
const KEY = "dsh-labnana:version-notice:last-shown";

function storage() {
  const values = new Map();
  return {
    values,
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
}

function environment() {
  const listeners = new Set();
  const timers = new Set();
  let available = true;
  return {
    listeners, timers,
    canPresent: () => available,
    watch(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    later(callback, milliseconds) {
      assert.equal(milliseconds, 500);
      timers.add(callback);
      return () => timers.delete(callback);
    },
    change(next) { available = next; for (const listener of [...listeners]) listener(); },
    async tick() {
      for (const callback of [...timers]) { timers.delete(callback); callback(); }
      await flush();
    },
  };
}

function locks() {
  let tail = Promise.resolve();
  return {
    request(name, { signal }, callback) {
      assert.equal(name, "dsh-labnana:version-notice");
      const result = tail.then(() => {
        signal.throwIfAborted();
        return callback();
      });
      tail = result.then(() => {}, () => {});
      return result;
    },
  };
}

function options(environment, storage, present, extra = {}) {
  return { version: "0.3.5", environment, storage, present, onError: error => { throw error; }, ...extra };
}

// Exercise the production scheduler: mounting mutates the DOM, then dismissal
// removes the dialog and makes the modal slot available again, without reload.
{
  const { startVersionNotice } = await load();
  const env = environment();
  const store = storage();
  let opens = 0;
  let mounted;
  const dispose = startVersionNotice(options(env, store, () => {
    opens++;
    env.change(false);
    return new Promise(resolve => { mounted = resolve; });
  }));
  await env.tick();
  assert.equal(opens, 1);
  assert.equal(store.getItem(KEY), null, "opening has not yet confirmed a visible mount");
  assert.equal(env.listeners.size, 1);
  mounted(true);
  await flush();
  assert.equal(store.getItem(KEY), "0.3.5");
  assert.equal(env.listeners.size, 0, "completed presentation disconnects observation");
  env.change(true); // dismiss: actual triggering pattern of the original bug
  await env.tick();
  env.change(true); // unrelated subsequent DOM/visibility change
  await env.tick();
  assert.equal(opens, 1);
  dispose();
  const remount = startVersionNotice(options(env, store, async () => { opens++; return true; }));
  await env.tick();
  assert.equal(opens, 1);
  remount();
  const nextRelease = startVersionNotice(options(env, store, async () => { opens++; return true; }, { version: "0.3.6" }));
  await env.tick();
  assert.equal(opens, 2);
  assert.deepEqual([...store.values], [[KEY, "0.3.6"]]);
  nextRelease();
}

// Wait for another plugin; losing that slot during mount permits a retry.
{
  const { startVersionNotice } = await load();
  const env = environment();
  env.change(false);
  const store = storage();
  let calls = 0;
  const dispose = startVersionNotice(options(env, store, async () => ++calls === 1 ? "slot-lost" : true));
  await env.tick();
  assert.equal(calls, 0);
  env.change(true);
  await env.tick();
  assert.equal(calls, 1);
  assert.equal(store.getItem(KEY), null);
  await env.tick();
  assert.equal(calls, 2);
  assert.equal(store.getItem(KEY), "0.3.5");
  dispose();
}

// Cancellation and mount failure do not consume the page's version claim.
for (const cancel of [true, false]) {
  const { startVersionNotice } = await load();
  const env = environment();
  const store = storage();
  let settle;
  let errors = 0;
  const dispose = startVersionNotice(options(env, store, signal => new Promise(resolve => {
    settle = resolve;
    signal.addEventListener("abort", () => resolve(false), { once: true });
  }), { onError: () => errors++ }));
  await env.tick();
  if (cancel) dispose();
  else settle(false);
  await flush();
  assert.equal(store.getItem(KEY), null);
  assert.equal(errors, cancel ? 0 : 1);
  dispose();
  let calls = 0;
  const retry = startVersionNotice(options(env, store, async () => { calls++; return true; }));
  await env.tick();
  assert.equal(calls, 1);
  retry();
}

// Re-read inside the lock, not just when the overlay first mounts.
{
  const { startVersionNotice } = await load();
  const env = environment();
  const store = storage();
  let grant;
  let calls = 0;
  const dispose = startVersionNotice(options(env, store, async () => { calls++; return true; }, {
    locks: { request: (_name, _options, callback) => new Promise(resolve => { grant = () => resolve(callback()); }) },
  }));
  await env.tick();
  store.setItem(KEY, "0.3.5"); // another tab displayed it while we waited
  grant();
  await flush();
  assert.equal(calls, 0);
  dispose();
}

// Independent module instances represent tabs; their native lock is shared.
{
  const tabs = await Promise.all([load(), load()]);
  const store = storage();
  const sharedLocks = locks();
  const environments = [environment(), environment()];
  let calls = 0;
  const disposers = tabs.map(({ startVersionNotice }, i) => startVersionNotice(options(
    environments[i], store, async () => { calls++; await flush(); return true; }, { locks: sharedLocks },
  )));
  await Promise.all(environments.map(env => env.tick()));
  await flush();
  assert.equal(calls, 1);
  assert.equal(store.getItem(KEY), "0.3.5");
  disposers.forEach(dispose => dispose());
}

// Storage failure suppresses automatic prompts rather than retrying on mutations.
{
  const { startVersionNotice } = await load();
  const env = environment();
  let errors = 0;
  let calls = 0;
  const broken = { getItem: () => null, setItem: () => { throw Error("denied"); }, removeItem() {} };
  const dispose = startVersionNotice(options(env, broken, async () => { calls++; return true; }, { onError: () => errors++ }));
  await env.tick();
  env.change(true);
  await env.tick();
  assert.equal(calls, 0);
  assert.equal(errors, 1);
  assert.equal(env.listeners.size, 0);
  dispose();
}

// Disposal before the settle timer leaves no work behind.
{
  const { startVersionNotice } = await load();
  const env = environment();
  const dispose = startVersionNotice(options(env, storage(), async () => { assert.fail("disposed overlay opened"); }));
  dispose();
  await env.tick();
  assert.equal(env.listeners.size, 0);
  assert.equal(env.timers.size, 0);
}

console.log("version notice: dismissal lifecycle, slot retry, mounted acknowledgment, cancellation, storage and cross-tab coordination passed");
