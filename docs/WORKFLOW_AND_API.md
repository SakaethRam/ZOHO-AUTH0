# Workflow and API Reference

## End-to-end workflow

1. User initiates login from Zoho Cliq.
2. The auth layer (`auth_layer.dg`) generates the Auth0 authorization URL.
3. The user completes authentication via Auth0's hosted login.
4. Auth0 redirects to the backend's callback endpoint.
5. The backend exchanges the authorization code for an access token.
6. The token is stored, mapped to the Cliq `user_id`.
7. The client (Deluge) verifies authentication by calling `/check-token`.
8. Once verified, the AI layer (`ai_layer.dg`) is allowed to process user queries.

## FastAPI test server endpoints (`auth0-main/auth0_server.py`)

This server exists to exercise the flow locally, with in-memory storage. Treat it as a reference implementation of the contract the production backend must also satisfy, not as something to deploy.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth0/config` | GET | Returns Auth0 configuration details (domain, client ID) needed to construct the authorization URL. |
| `/auth0/callback` | GET | Handles the OAuth callback: exchanges the authorization code for a token. |
| `/check-token` | GET | Verifies whether the current session's token is valid. |
| `/secure-data` | GET | A sample protected endpoint, gated on a valid token, for testing that the verification gate actually blocks unauthenticated requests. |

## Production backend (`auth0-backend/server.js`)

Implements the same functional contract as the FastAPI test server, but backed by durable session storage rather than in-memory state, and deployed on Render rather than run locally. See `SETUP_AND_DEPLOYMENT.md` for its required environment variables.

## Contract parity

Because the FastAPI server and the Node.js backend are meant to satisfy the same interface (same endpoint shapes, same token/session semantics), a change to one should be mirrored in the other, or explicitly noted as a divergence. Otherwise a flow that works against the test server can silently fail against production, or vice versa.

## Request/response shape (illustrative)

The public README doesn't specify exact payload schemas, so treat the following as the minimum contract each endpoint needs to satisfy, to be confirmed against the actual implementation before being treated as fixed:

- `/auth0/config` → `{ domain, clientId, audience }`
- `/auth0/callback?code=...&state=...` → exchanges `code`, validates `state` against the pending Cliq `user_id`, stores the resulting token
- `/check-token?user_id=...` → `{ authenticated: true|false }`
- `/secure-data` → 401 if unauthenticated, otherwise the protected payload
