# Security Considerations

## OAuth flow

The module uses the OAuth 2.0 Authorization Code Flow, not an implicit or PKCE-less flow. This matters here specifically because the flow has a confidential client (the backend, holding a client secret) rather than only a public client, which is the correct choice given Deluge scripts cannot safely hold a secret themselves.

## The `state` parameter

`state` maps a given Auth0 authentication attempt back to the Cliq `user_id` that initiated it. Two things this needs to hold true to actually provide security, not just plumbing:

- `state` should be unpredictable (not a bare `user_id` or sequential value) so a third party can't forge a callback and have it associated with someone else's session.
- The backend should validate that the `state` it receives on `/auth0/callback` matches one it actually issued, and should reject or ignore callbacks with an unrecognized or reused `state`.

## Secret handling

- Sensitive credentials (`AUTH0_CLIENT_SECRET`, and by extension anything derived from the token exchange) are handled only in the backend, never in Deluge.
- Deluge scripts do not expose secrets: the auth layer only ever sees the authorization URL it needs to redirect to and the verification result it gets back from `/check-token`, never the client secret or raw access token.

## What the backend is trusted with

The backend is the single point that holds:

- `AUTH0_CLIENT_SECRET`
- Issued access tokens, mapped to `user_id`
- The authority to decide whether a given `user_id` is currently authenticated

Because of that concentration, the backend's own deployment security (see `SETUP_AND_DEPLOYMENT.md`) is effectively the security boundary for the whole system. Locking down the Deluge scripts without equally securing the backend's environment variables and deployment would leave the actual point of compromise unaddressed.

## Known limitation: the FastAPI test server

`auth0-main/auth0_server.py` is explicitly a testing implementation with in-memory storage. In-memory storage means:

- Tokens do not survive a process restart, which is fine for local testing but would silently break sessions if this were ever mistaken for the production path.
- There is no persistence layer to audit after the fact, which matters if you need to investigate a suspected compromised session.

Do not point a real Cliq installation at the FastAPI test server. It exists to validate the flow's logic, not to hold real user sessions.

## Threat model summary

| Threat | Mitigation in this design |
|--------|----------------------------|
| Secret exposure via Deluge | Secrets never leave the backend; Deluge only handles redirects and verification calls. |
| Cross-user token binding | `state` parameter ties a callback to the originating `user_id`. |
| Unauthenticated access to AI layer | AI layer only executes after the auth layer's verification gate passes. |
| Stolen/replayed authorization code | Standard OAuth Authorization Code Flow semantics apply: codes are single-use and exchanged server-side. |
| Compromised test server mistaken for production | Explicitly documented as testing-only, in-memory, not to be deployed with real user data. |

## Disclaimer from the source repository

The README notes this module is part of a beta engine and represents a prototype-level implementation, with the distributed code intentionally simplified to demonstrate functionality while protecting core architectural design elements. Treat this security documentation as covering the documented design intent, not as a guarantee that the distributed code implements every mitigation listed above; verify each item against the actual `auth0-backend/server.js` implementation before relying on it in production.
