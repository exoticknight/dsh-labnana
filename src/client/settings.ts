export type RemoteResult<T> = { ok: true; value: T } | { ok: false; error: { code?: string; message: string } };
export interface CredentialState { ref: string; configured: boolean; writable: boolean; error?: string }
export interface CredentialsRemote {
  describe(refs: string[]): Promise<RemoteResult<Record<string, { configured: boolean; writable: boolean }>>>;
  set(ref: string, value: string): Promise<RemoteResult<void>>;
  unset(ref: string): Promise<RemoteResult<void>>;
}
function unwrap<T>(result: RemoteResult<T>): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

// dsh 0.1.2-rc.1+ uses the typed remote face and positional arguments.
// Immutable snapshots and a read generation keep reconnects from restoring stale state.
export function createCredentials(remote: CredentialsRemote, refOf: () => string) {
  let state: CredentialState = { ref: refOf(), configured: false, writable: false };
  let generation = 0;
  let disposed = false;
  const listeners = new Set<(state: CredentialState) => void>();
  const publish = (next: CredentialState) => { state = next; for (const listener of listeners) listener(state); };
  async function refresh(): Promise<CredentialState> {
    const ref = refOf();
    const read = ++generation;
    try {
      const values = unwrap(await remote.describe([ref]));
      const value = values[ref];
      const next = { ref, configured: value?.configured ?? false, writable: value?.writable ?? false };
      if (!disposed && read === generation && ref === refOf()) publish(next);
      return next;
    } catch (error) {
      const next = { ...state, ref, error: error instanceof Error ? error.message : String(error) };
      if (!disposed && read === generation && ref === refOf()) publish(next);
      return next;
    }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: (state: CredentialState) => void) { listeners.add(listener); listener(state); return () => { listeners.delete(listener); }; },
    refresh,
    async write(value: string) {
      unwrap(await remote.set(refOf(), value));
      const next = await refresh();
      if (next.error || !next.configured) throw new Error(next.error ?? "Credential could not be read back after saving.");
      return true;
    },
    async clear() { unwrap(await remote.unset(refOf())); const next = await refresh(); if (next.error) throw new Error(next.error); },
    dispose() { disposed = true; generation++; listeners.clear(); },
  };
}

export interface ScopeSnapshot {
  status?: string;
  value?: Record<string, unknown>;
  user?: Record<string, unknown>;
  revision?: number;
  writable: boolean;
}
export interface SettingsScope {
  getSnapshot(): ScopeSnapshot;
  subscribe(listener: () => void): () => void;
  mutate(ops: Array<{ op: "set"; path: string[]; value: unknown }>, revision?: number): Promise<unknown>;
}
export async function saveFields(scope: SettingsScope, fields: Array<[string, unknown]>) {
  const before = scope.getSnapshot();
  if (!before.writable) throw new Error("Settings are read-only.");
  const changed = fields.filter(([field, value]) => before.value?.[field] !== value);
  if (!changed.length) return;
  await scope.mutate(changed.map(([field, value]) => ({ op: "set", path: [field], value })), before.revision);
  // Official scopes recover rather than throw on refused writes. Check the
  // committed values, not merely whether an old override exists.
  const after = scope.getSnapshot();
  const failed = changed.filter(([field, value]) => after.value?.[field] !== value);
  if (failed.length) throw new Error(`Settings were not saved: ${failed.map(([field]) => field).join(", ")}`);
}
