import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { transform } from "esbuild";
const source = await fs.readFile(new URL("../src/client/settings.ts", import.meta.url), "utf8");
const { code } = await transform(source, { loader: "ts", format: "esm", target: "node20" });
const { createCredentials, saveFields } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

const values = {};
let reject = false;
const remote = {
  async describe(refs) {
    assert.ok(Array.isArray(refs));
    return { ok: true, value: Object.fromEntries(refs.map(ref => [ref, { configured: ref in values, writable: true }])) };
  },
  async set(ref, value) {
    assert.equal(typeof ref, "string");
    assert.equal(typeof value, "string");
    if (reject) return { ok: false, error: { message: "Credential write refused" } };
    values[ref] = value;
    return { ok: true };
  },
  async unset(ref) { delete values[ref]; return { ok: true }; },
};
const credentials = createCredentials(remote, () => "LABNANA_TEST");
await credentials.refresh();
const before = credentials.getSnapshot();
await credentials.write("test-only");
assert.equal(credentials.getSnapshot().configured, true);
assert.equal(before.configured, false);
reject = true;
await assert.rejects(credentials.write("replacement"), /refused/);
assert.equal(values.LABNANA_TEST, "test-only");
await credentials.clear();
assert.equal(credentials.getSnapshot().configured, false);
credentials.dispose();

let snapshot = { writable: true, revision: 1, value: { model: "old", size: "2K" }, user: { model: "old" } };
let mutations = 0;
const scope = {
  getSnapshot: () => snapshot,
  async mutate(ops, revision) {
    mutations++;
    assert.equal(revision, snapshot.revision);
    snapshot = { ...snapshot, revision: revision + 1, value: { ...snapshot.value, ...Object.fromEntries(ops.map(op => [op.path[0], op.value])) } };
  },
};
await saveFields(scope, [["model", "new"], ["size", "1K"]]);
assert.equal(mutations, 1);
await saveFields(scope, [["model", "new"]]);
assert.equal(mutations, 1);
await assert.rejects(saveFields({ ...scope, mutate: async () => {} }, [["model", "refused"]]), /not saved/);
console.log("client settings: typed credentials, immutable readback, refused writes and atomic field saves passed");
