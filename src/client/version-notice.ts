export const VERSION_NOTICE_STORAGE_KEY = "dsh-labnana:version-notice-dismissed";

export type VersionNoticeKind = "installed" | "updated";

export interface VersionNoticeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getVersionNoticeKind(currentVersion: string, dismissedVersion: string | null): VersionNoticeKind | null {
  if (dismissedVersion === currentVersion) return null;
  return dismissedVersion === null ? "installed" : "updated";
}

export function readDismissedVersion(storage: VersionNoticeStorage): string | null {
  return storage.getItem(VERSION_NOTICE_STORAGE_KEY);
}

export function persistVersionNoticeDismissal(storage: VersionNoticeStorage, version: string): void {
  storage.setItem(VERSION_NOTICE_STORAGE_KEY, version);
}
