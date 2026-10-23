export const VERSION_NOTICE_STORAGE_KEY = "dsh-labnana:version-notice:last-shown";
export const VERSION_NOTICE_LOCK_NAME = "dsh-labnana:version-notice";

export type VersionNoticeStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type VersionNoticeMountResult = boolean | "slot-lost";

export interface VersionNoticeEnvironment {
  canPresent(): boolean;
  watch(listener: () => void): () => void;
  later(callback: () => void, milliseconds: number): () => void;
}

interface VersionNoticeOptions {
  version: string;
  storage?: VersionNoticeStorage;
  locks?: Pick<LockManager, "request">;
  environment: VersionNoticeEnvironment;
  present(signal: AbortSignal): Promise<VersionNoticeMountResult>;
  onError(error: unknown): void;
}

// Native Web Locks coordinate tabs. The page queue also covers duplicate overlay
// mounts and preserves single-page support in browsers without Web Locks.
let pageQueue = Promise.resolve();
const shownThisPage = new Set<string>();

/** Watch only until this startup attempt finishes; retry only a lost modal slot. */
export function startVersionNotice(options: VersionNoticeOptions): () => void {
  const { environment, version, storage, locks } = options;
  const controller = new AbortController();
  const { signal } = controller;
  let finished = false;
  let attempting = false;
  let cancelTimer: (() => void) | undefined;
  let unwatch = () => {};
  const stopWatching = () => {
    cancelTimer?.();
    cancelTimer = undefined;
    unwatch();
  };

  const present = async (): Promise<"finished" | "retry"> => {
    if (signal.aborted || shownThisPage.has(version)) return "finished";
    // Recheck under the lock, after waiting for other dialogs/tabs. If storage
    // cannot retain an acknowledgment, suppress the automatic announcement.
    if (!storage) {
      options.onError(new Error("Browser storage is unavailable; automatic version notice skipped."));
      return "finished";
    }
    try {
      const previous = storage.getItem(VERSION_NOTICE_STORAGE_KEY);
      if (previous === version) return "finished";
      storage.setItem(VERSION_NOTICE_STORAGE_KEY, previous ?? "storage-probe");
      if (previous === null) storage.removeItem(VERSION_NOTICE_STORAGE_KEY);
    } catch (error) {
      options.onError(error);
      return "finished";
    }
    if (!environment.canPresent()) return "retry";
    const mounted = await options.present(signal);
    if (signal.aborted) return "finished";
    if (mounted === "slot-lost") return "retry";
    if (!mounted) {
      options.onError(new Error("Version notice dialog did not mount."));
      return "finished";
    }
    shownThisPage.add(version);
    try {
      storage.setItem(VERSION_NOTICE_STORAGE_KEY, version);
    } catch (error) {
      // A successfully mounted notice stays consumed for this page even when
      // a later storage failure prevents persistence across reloads.
      options.onError(error);
    }
    return "finished";
  };

  const schedule = () => {
    if (finished || attempting || signal.aborted) return;
    if (!environment.canPresent()) {
      cancelTimer?.();
      cancelTimer = undefined;
      return;
    }
    if (cancelTimer) return;
    cancelTimer = environment.later(() => {
      cancelTimer = undefined;
      if (signal.aborted || !environment.canPresent()) return;
      attempting = true;
      const attempt = pageQueue.then(() => signal.aborted ? "finished" as const : locks
        ? locks.request(VERSION_NOTICE_LOCK_NAME, { signal }, present)
        : present());
      pageQueue = attempt.then(() => {}, () => {});
      void attempt.then(result => {
        finished = result !== "retry";
      }).catch(error => {
        finished = true;
        if (!signal.aborted) options.onError(error);
      }).finally(() => {
        attempting = false;
        if (finished || signal.aborted) stopWatching();
        else schedule();
      });
    }, 500);
  };

  unwatch = environment.watch(schedule);
  schedule();
  return () => {
    controller.abort();
    stopWatching();
  };
}
