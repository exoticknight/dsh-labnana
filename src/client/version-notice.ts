export const VERSION_NOTICE_STORAGE_KEY = "dsh-labnana:version-dialog-shown";

export interface VersionNoticeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function shouldShowVersionNotice(currentVersion: string, shownVersion: string | null): boolean {
  return shownVersion !== currentVersion;
}

export function readShownVersion(storage: VersionNoticeStorage): string | null {
  return storage.getItem(VERSION_NOTICE_STORAGE_KEY);
}

export function persistVersionNoticeShown(storage: VersionNoticeStorage, version: string): void {
  storage.setItem(VERSION_NOTICE_STORAGE_KEY, version);
}
