export const VERSION_NOTICE_STORAGE_KEY = "dsh-labnana:version-dialog-shown";

export type VersionNoticeKind = "installed" | "updated";

export interface VersionNoticeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getVersionNoticeKind(currentVersion: string, shownVersion: string | null): VersionNoticeKind | null {
  if (shownVersion === currentVersion) return null;
  return shownVersion === null ? "installed" : "updated";
}

export function readShownVersion(storage: VersionNoticeStorage): string | null {
  return storage.getItem(VERSION_NOTICE_STORAGE_KEY);
}

export function persistVersionNoticeShown(storage: VersionNoticeStorage, version: string): void {
  storage.setItem(VERSION_NOTICE_STORAGE_KEY, version);
}
