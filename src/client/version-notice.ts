export const VERSION_NOTICE_STORAGE_KEY = "dsh-labnana:version-notice:last-shown";

export interface VersionNoticeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function shouldShowVersionNotice(storage: VersionNoticeStorage, version: string): boolean {
  return storage.getItem(VERSION_NOTICE_STORAGE_KEY) !== version;
}

export function persistVersionNoticeShown(storage: VersionNoticeStorage, version: string): void {
  storage.setItem(VERSION_NOTICE_STORAGE_KEY, version);
}
