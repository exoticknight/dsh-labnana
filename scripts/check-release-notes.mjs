import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import { readCurrentReleaseNotice, validateReleaseNotice } from "./release-notes.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const notice = readCurrentReleaseNotice(root);
const { code } = await transform(await fs.readFile(new URL("../src/client/release-notes.ts", import.meta.url), "utf8"), {
  loader: "ts", format: "esm",
  define: { __LABNANA_RELEASE_NOTICE_JSON__: JSON.stringify(JSON.stringify(notice)) },
});
const { RELEASE_NOTICE, RELEASE_NOTICE_KINDS, groupReleaseNoticeHighlights } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`,
);
assert.deepEqual(RELEASE_NOTICE, notice);

// Same fixed template handles multiple categories, title-only entries, and
// title + description entries. Only the content data varies between releases.
const items = [
  { kind: "fixed", title: "Bug fix" },
  { kind: "added", title: "New feature", description: "Feature details" },
  { kind: "migration", title: "Migration", description: "Required action" },
  { kind: "improved", title: "Improvement" },
  { kind: "added", title: "Another feature" },
];
const groups = groupReleaseNoticeHighlights(items);
assert.deepEqual(groups.map(group => group.kind), RELEASE_NOTICE_KINDS);
assert.deepEqual(groups[1].highlights, [items[1], items[4]]);
assert.deepEqual(groupReleaseNoticeHighlights([items[0]]), [{ kind: "fixed", highlights: [items[0]] }]);

const sample = { id: "1.0.0", version: "1.0.0", highlights: { zh: items, en: items } };
assert.equal(validateReleaseNotice({ "1.0.0": sample }, "1.0.0"), sample);
assert.throws(() => validateReleaseNotice({}, "1.0.0"), /Missing release-notes/);
assert.throws(() => validateReleaseNotice({ "1.0.0": { ...sample, version: "0.9.0" } }, "1.0.0"), /must equal/);
for (const replacement of [[], [{ kind: "other", title: "Wrong kind" }], [{ kind: "fixed", title: "" }],
  [{ kind: "fixed", title: "Fix", description: "" }]]) {
  assert.throws(() => validateReleaseNotice({ "1.0.0": { ...sample, highlights: { zh: replacement, en: items } } }, "1.0.0"));
}
assert.throws(() => validateReleaseNotice({ "1.0.0": { ...sample, highlights: { zh: items } } }, "1.0.0"), /en highlights/);

console.log("release notes: version-selected bilingual data, category order, optional descriptions and build validation passed");
