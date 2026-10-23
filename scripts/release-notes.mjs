import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const kinds = new Set(["migration", "added", "improved", "fixed"]);

export function readCurrentReleaseNotice(root) {
  const { version } = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  const catalog = JSON.parse(readFileSync(resolve(root, "src/client/release-notes.json"), "utf8"));
  return validateReleaseNotice(catalog, version);
}

export function validateReleaseNotice(catalog, version) {
  const notice = catalog[version];
  if (!notice || typeof notice !== "object" || Array.isArray(notice))
    throw new Error(`Missing release-notes entry for package version ${version}.`);
  if (notice.id !== version || notice.version !== version)
    throw new Error(`Release-notes id and version must equal package.json version ${version}.`);
  for (const locale of ["zh", "en"]) {
    const highlights = notice.highlights?.[locale];
    if (!Array.isArray(highlights) || highlights.length === 0)
      throw new Error(`Release-notes ${version} needs non-empty ${locale} highlights.`);
    for (const [index, item] of highlights.entries()) {
      if (!item || typeof item !== "object" || !kinds.has(item.kind))
        throw new Error(`Release-notes ${locale} item ${index + 1} needs a valid kind.`);
      if (typeof item.title !== "string" || !item.title.trim())
        throw new Error(`Release-notes ${locale} item ${index + 1} needs a title.`);
      if (item.description !== undefined && (typeof item.description !== "string" || !item.description.trim()))
        throw new Error(`Release-notes ${locale} item ${index + 1} has an empty description.`);
    }
  }
  return notice;
}
