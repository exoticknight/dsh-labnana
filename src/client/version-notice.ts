export const VERSION_NOTICE_STORAGE_KEY_PREFIX = "dsh-labnana:version-dialog-shown:";

export interface VersionNoticeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function versionNoticeStorageKey(version: string): string {
  return VERSION_NOTICE_STORAGE_KEY_PREFIX + version;
}

export function shouldShowVersionNotice(storage: VersionNoticeStorage, version: string): boolean {
  return storage.getItem(versionNoticeStorageKey(version)) !== "shown";
}

export function persistVersionNoticeShown(storage: VersionNoticeStorage, version: string): void {
  storage.setItem(versionNoticeStorageKey(version), "shown");
}
