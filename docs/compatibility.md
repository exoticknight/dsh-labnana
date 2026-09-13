# dsh compatibility

Minimum supported dsh: 0.1.2-rc.1. Local desktop verification: 0.1.5-rc.2.

## Integration contracts

- Host settings use optional `ctx.inject(["settings"], ...)` and the provider's `installSection`. The former standalone settings exports were removed before the supported minimum.
- Credentials use `ctx.remote.credentials.describe([ref])`, `set(ref, value)` and `unset(ref)`. Their result is `{ ok, value }` or `{ ok: false, error }`. The former `connection.api` calls and nested `response.result` parsing caused key saves and status reads to fail.
- Settings use `scope.mutate(ops, revision)` and `scope.getSnapshot()`. A refused mutation can resolve after recovery, so the committed values must be checked. Changed fields are submitted together; unchanged fields retain their existing inheritance.
- Credential snapshots are immutable. Concurrent reads are ordered and event subscriptions are disposed with the plugin. Credential failures reach the form instead of being swallowed.
- Connection tests accept an optional draft key in the POST body, use it only for that request, and retain empty-body compatibility. Persisting a key is a separate explicit Save action.
- Client auxiliary buttons and chevrons reuse `@deepseek-ai/dsh-client-ui-primitives` through the host module loader. The dependency is for build-time types and remains external in the browser bundle. Official plugin-card components are private exports. Their PluginCard.module.css and fields.module.css are vendored under src/client/official with the MIT license; only class selectors are renamed. Card fields and footer buttons use the same native elements as the official cards.
- Runtime version labels are generated from package.json. The tool registry and optional settings/prompt services retain their Cordis disposal behavior.

The credentials and settings contracts above were checked against the official 0.1.2-rc.1 and 0.1.5-rc.2 published implementations.

## Verification

`npm run check` covers type checking, both bundles, real Cordis/settings-provider attachment and detachment, four tool registrations and cleanup, subscription execution with a stubbed upstream, draft-key routing, credential read/write/error behavior, and settings mutation/readback.

On the user's web profile with dsh 0.1.5-rc.2:

1. Loaded the full application and Labnana settings card.
2. Saved a clearly invalid test-only credential, confirmed the configured badge and persistence, then cleared it and verified the unconfigured state.
3. Saved a normal preference and restored its original value.
4. Verified that unsupported 4K choices disappear when switching to Wan 2.7 Image and that Discard restores saved defaults.
5. Inspected the official and Labnana settings layouts and verified the official primitive components render through the runtime loader.

Live paid image generation and every intermediate prerelease were not exercised. Tests use stubs for the Labnana API; the actual credential used for the local persistence check was removed afterward.
