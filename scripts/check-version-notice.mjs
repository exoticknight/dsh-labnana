import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { transform } from "esbuild";

const source = await fs.readFile(new URL("../src/client/version-notice.ts", import.meta.url), "utf8");
const { code } = await transform(source, { loader: "ts", format: "esm", target: "node20" });
const { getVersionNoticeKind, persistVersionNoticeShown, readShownVersion, VERSION_NOTICE_STORAGE_KEY } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

assert.equal(VERSION_NOTICE_STORAGE_KEY, "dsh-labnana:version-dialog-shown");
const values = new Map();
values.set("dsh-labnana:version-notice-dismissed", "0.3.5");
const storage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};
assert.equal(getVersionNoticeKind("0.3.5", readShownVersion(storage)), "installed");
persistVersionNoticeShown(storage, "0.3.5");
assert.equal(getVersionNoticeKind("0.3.5", readShownVersion(storage)), null);
assert.equal(getVersionNoticeKind("0.3.6", readShownVersion(storage)), "updated");
persistVersionNoticeShown(storage, "0.3.6");
assert.equal(getVersionNoticeKind("0.3.6", readShownVersion(storage)), null);

console.log("version notice: first display, persisted version, and version change passed");
