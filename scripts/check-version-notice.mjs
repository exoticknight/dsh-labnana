import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { transform } from "esbuild";

const source = await fs.readFile(new URL("../src/client/version-notice.ts", import.meta.url), "utf8");
const { code } = await transform(source, { loader: "ts", format: "esm", target: "node20" });
const { shouldShowVersionNotice, persistVersionNoticeShown, VERSION_NOTICE_STORAGE_KEY } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

assert.equal(VERSION_NOTICE_STORAGE_KEY, "dsh-labnana:version-notice:last-shown");
const values = new Map();
const storage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};
assert.equal(shouldShowVersionNotice(storage, "0.3.5"), true);
persistVersionNoticeShown(storage, "0.3.5");
assert.deepEqual([...values], [[VERSION_NOTICE_STORAGE_KEY, "0.3.5"]]);
assert.equal(shouldShowVersionNotice(storage, "0.3.5"), false);
assert.equal(shouldShowVersionNotice(storage, "0.3.6"), true);
persistVersionNoticeShown(storage, "0.3.6");
assert.deepEqual([...values], [[VERSION_NOTICE_STORAGE_KEY, "0.3.6"]]);
assert.equal(shouldShowVersionNotice(storage, "0.3.6"), false);

console.log("version notice: last-shown marker and next-release display passed");
