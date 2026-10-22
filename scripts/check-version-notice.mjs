import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { transform } from "esbuild";

const source = await fs.readFile(new URL("../src/client/version-notice.ts", import.meta.url), "utf8");
const { code } = await transform(source, { loader: "ts", format: "esm", target: "node20" });
const { shouldShowVersionNotice, persistVersionNoticeShown, versionNoticeStorageKey, VERSION_NOTICE_STORAGE_KEY_PREFIX } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

assert.equal(VERSION_NOTICE_STORAGE_KEY_PREFIX, "dsh-labnana:version-dialog-shown:");
const values = new Map();
values.set("dsh-labnana:version-notice-dismissed", "0.3.5");
values.set(versionNoticeStorageKey("0.3.4"), "shown");
const storage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};
assert.equal(versionNoticeStorageKey("0.3.5"), "dsh-labnana:version-dialog-shown:0.3.5");
assert.equal(shouldShowVersionNotice(storage, "0.3.5"), true);
persistVersionNoticeShown(storage, "0.3.5");
assert.equal(shouldShowVersionNotice(storage, "0.3.5"), false);
assert.equal(shouldShowVersionNotice(storage, "0.3.6"), true);
persistVersionNoticeShown(storage, "0.3.6");
assert.equal(shouldShowVersionNotice(storage, "0.3.6"), false);

console.log("version notice: per-release flag, no prior-version lookup, and one-time display passed");
