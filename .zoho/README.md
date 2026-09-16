# `.zoho/` — Cliq Extension Packaging

## What's in here

- `plugin-manifest.json` — the extension descriptor Zoho's extension platform expects, following the standard `plugin-manifest.json` format documented across Zoho's products (Cliq, Desk, Projects, Writer): `locale`, `service`, `storage`, `whiteListedDomains`, and a `connectors` array for third-party service authorization.
- `config.json` — a local convenience file mapping named environments (`local`, `production`) to the backend URL the Deluge auth layer should call, so switching between the FastAPI test server and the Render-deployed backend is a one-line change rather than editing `auth_layer.dg` directly.

## Important: verify before packaging for real

The source repository (`SakaethRam/ZOHO-AUTH0`) does not include a `.zoho/` folder or a committed `plugin-manifest.json` in what's publicly visible. The files here were built from Zoho's documented, cross-product `plugin-manifest.json` schema and from what the README states about this extension's behavior (an Auth0 connector, a Cliq service context, domains for Auth0 and the Render-hosted backend). Two specific things are not independently confirmed against this project's actual Cliq packaging and should be checked before you run `zet validate` or `zet pack` against them:

1. **The `connectors` block's exact shape for an Auth0-based connector.** Zoho's connector configuration is normally generated from a connection you set up in the Zoho API Console or extension developer console (which produces the `connectionLinkName` / `connectionName` / `serviceName` values), not hand-written from scratch. You'll likely need to create that connection first and copy its generated values in, rather than using the placeholder values here as-is.
2. **The `handlers` key.** This is illustrative, showing how `auth_layer.dg` and `ai_layer.dg` conceptually map into the extension, not a confirmed key in Zoho's manifest schema. Zoho Cliq typically wires Deluge scripts through bot message/command handlers configured in the Cliq bot builder itself rather than a bare `handlers` object in the manifest; check the current Zoho Cliq extension developer guide (or run `zet init` to see the scaffold it generates) before relying on this key.

If you have the Zoho Extension Toolkit (`zet`) installed, `zet validate` against this folder will tell you definitively what's wrong before you try to `zet pack` and submit.
