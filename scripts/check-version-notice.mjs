import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { transform } from "esbuild";

const source = await fs.readFile(new URL("../src/client/version-notice.ts", import.meta.url), "utf8");
const { code } = await transform(source, { loader: "ts", format: "esm", target: "node20" });
const { getVersionNoticeKind, persistVersionNoticeDismissal, readDismissedVersion, VERSION_NOTICE_STORAGE_KEY } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

assert.equal(VERSION_NOTICE_STORAGE_KEY, "dsh-labnana:version-notice-dismissed");
const values = new Map();
const storage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};
assert.equal(getVersionNoticeKind("0.3.5", readDismissedVersion(storage)), "installed");
persistVersionNoticeDismissal(storage, "0.3.5");
assert.equal(getVersionNoticeKind("0.3.5", readDismissedVersion(storage)), null);
assert.equal(getVersionNoticeKind("0.3.6", readDismissedVersion(storage)), "updated");
persistVersionNoticeDismissal(storage, "0.3.6");
assert.equal(getVersionNoticeKind("0.3.6", readDismissedVersion(storage)), null);

console.log("version notice: first install, persisted dismissal, and version change passed");
