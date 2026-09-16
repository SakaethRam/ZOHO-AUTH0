# Architecture

ZOHO-AUTH0 is a decoupled authentication layer: Zoho Cliq's Deluge scripts handle client-side orchestration, a Node.js service on Render handles the actual OAuth exchange and session storage, and a FastAPI server exists purely as a local testing harness for that same flow. This document covers how those three pieces relate.

## Why decoupled

Deluge (Zoho Cliq's scripting language) can make HTTP calls and drive UI, but it is not where you want OAuth client secrets or session state to live: Deluge scripts are visible to whoever can edit the Cliq extension, and Cliq's execution model isn't built for holding long-lived server-side state. So the design draws a hard line: Deluge orchestrates, a real backend authenticates.

## Components

### Auth layer (`auth_layer.dg`, Deluge)

- Initiates the Auth0 login flow from inside Zoho Cliq.
- Redirects the user to authenticate with Auth0.
- Verifies the session by calling back to the backend.
- Restricts access to the AI layer for unauthenticated users; this is the gate the AI layer sits behind.

### AI layer (`ai_layer.dg`, Deluge)

- Only executes once the auth layer has confirmed the session is valid.
- Forwards user queries to the AI processing endpoint.
- Returns responses back into the Cliq interface.

Splitting auth and AI into separate Deluge scripts means the AI logic never has to re-implement or second-guess authentication; it trusts the auth layer's gate and nothing else.

### Backend layer (`auth0-backend/server.js`, Node.js, deployed on Render)

- Owns the actual OAuth token exchange with Auth0.
- Stores and manages user sessions, mapped by `user_id`.
- Exposes the endpoints the Deluge auth layer calls to verify a session.

This is the only component that ever holds the Auth0 client secret.

### FastAPI test server (`auth0-main/auth0_server.py`)

A parallel, in-memory implementation of the same token-exchange and verification endpoints, used for local testing of the flow without needing a live Render deployment or real Cliq installation. It mirrors the production backend's contract but is explicitly not the production path (see `SETUP_AND_DEPLOYMENT.md`).

## Data flow

```
Zoho Cliq (auth_layer.dg)
        │  1. build Auth0 authorization URL
        ▼
   Auth0 (hosted login)
        │  2. user authenticates
        ▼
Backend /auth0/callback (Node.js on Render, or FastAPI test server locally)
        │  3. exchange auth code for access token
        │  4. store token, mapped to user_id
        ▼
Zoho Cliq (auth_layer.dg) ── 5. GET /check-token ──▶ Backend
        │  6. verified
        ▼
Zoho Cliq (ai_layer.dg) ── 7. forwards query ──▶ AI processing endpoint
```

## Why the `state` parameter matters here specifically

Because Cliq is a multi-user, always-on chat surface rather than a single browser session, the OAuth `state` parameter is what ties a given Auth0 callback back to the specific Cliq `user_id` that started the flow. Without that mapping, a callback landing on the backend would have no reliable way to know which Cliq user it belongs to. See `SECURITY.md` for how this is used to prevent cross-user token leakage.
