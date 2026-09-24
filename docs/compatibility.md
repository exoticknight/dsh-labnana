# dsh compatibility

The legacy API baseline is dsh 0.1.2-rc.1. The package peer ranges for `@deepseek-ai/dsh-settings` and `@deepseek-ai/dsh-tools` are `>=0.1.2-rc.1 || >=0.1.7-alpha.2`. The 0.1.7 prerelease API line was verified on a local dsh 0.1.7-rc.1 profile. A separate local profile using 0.1.5-rc.2 verifies the older settings integration.

## Settings integration

### Legacy API line

- Host settings attach through `ctx.inject(["settings"], ...)` and the provider's `installSection` method.
- The client reads and writes settings through `settingsScope`, registering its view in `settings.plugin.item`.
- In the web UI, open **Settings → Plugins → Configurable → Labnana**. The settings form is shown inside a collapsible card.

### dsh 0.1.7 prerelease API line

- Host settings use `SettingsForms.configure({ auto: false }, owner)` to disable the provider-owned settings page, then listen for `settings/document-updated` to refresh the system prompt.
- The client uses `configForms.get`, `describe`, and `whileServed`, and registers the form in `plugins.bundle.config`. The Plugin Manager renders this slot with `view: "page"` on the bundle detail page.
- In the web UI, open **Plugins → Installed → dsh-labnana**. The package detail supplies the title and description, and the settings fields appear directly on that page.
- Schemastery fields used by RC ConfigForms are volatile so edits are reflected in the live settings snapshot. This project depends on `@deepseek-ai/schemastery` `^3.18.4`; version 3.18.2 does not provide `.volatile()`.

## Shared integration contracts

- Both client settings paths use `scope.mutate(ops, revision)` and `scope.getSnapshot()`. A refused mutation can resolve after recovery, so verify the committed values. Submit changed fields together; unchanged fields retain their existing inheritance.
- Credentials use `ctx.remote.credentials.describe([ref])`, `set(ref, value)`, and `unset(ref)`. Results are `{ ok, value }` or `{ ok: false, error }`. Credential snapshots are immutable; concurrent reads are ordered, event subscriptions are disposed with the plugin, and credential errors reach the form.
- Connection tests accept an optional draft key in the POST body, use it only for that request, and retain empty-body compatibility. Saving a key is a separate explicit action.
- Client buttons reuse `@deepseek-ai/dsh-client-ui-primitives` through the host module loader. The dependency is for build-time types and remains external in the browser bundle. Official plugin-card components are private exports; their MIT-licensed PluginCard.module.css and fields.module.css are vendored under `src/client/official` with renamed class selectors.
- Runtime version labels come from package.json. Tool registrations, Web routes, retained image state, and optional settings/prompt services are released with their Cordis lifecycles.

## Compatibility verification

`npm run check` runs type checking, builds both bundles, and checks host settings lifecycle, connection request behavior, client credentials, and settings field updates. The settings and connection checks use a stubbed Labnana service.

| dsh runtime | Verified surface |
|---|---|
| 0.1.2-rc.1 | Minimum legacy API baseline; integration contract checked against its published APIs. |
| 0.1.5-rc.2 | Local web profile loaded the legacy settings card; credential and preference changes were saved and read back. |
| 0.1.7-rc.1 | Local web profile loaded RC ConfigForms; preferences persisted across restart, and the bundle detail showed the settings form directly without a nested expand action. |

Live paid image generation and every intermediate prerelease have not been exercised.
