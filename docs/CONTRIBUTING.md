# Contributing

## Before you start

This module handles authentication and holds an OAuth client secret in its backend. Treat changes to the auth flow with the same care you'd give any credential-handling code:

- Changes to `auth0-backend/server.js` or `auth0-main/auth0_server.py` that touch token exchange, session storage, or `state` validation should call out explicitly what changed and why in the PR description.
- Never commit real `AUTH0_CLIENT_SECRET`, tokens, or Cliq installation IDs in test fixtures or example code. Use placeholder values.
- If you change the endpoint contract described in `WORKFLOW_AND_API.md` (request/response shape, new required fields), update both the Node.js backend and the FastAPI test server together, or note the divergence explicitly (see "Contract parity" in that doc).

## Workflow

1. Fork the repository.
2. Create a feature branch.
3. Implement your change, scoped to one concern (Deluge auth layer, Deluge AI layer, Node.js backend, or FastAPI test server — avoid touching more than one unless the change genuinely spans them).
4. Test against the FastAPI local server first; confirm the Node.js backend still satisfies the same contract before considering the change done.
5. Submit a pull request with a clear description of what changed.

## Where to make changes

| Area | Location |
|------|----------|
| Cliq login orchestration | `auth0-main/auth_layer.dg` |
| Post-auth AI query handling | `auth0-main/ai_layer.dg` |
| Local test server | `auth0-main/auth0_server.py` |
| Production backend | `auth0-backend/server.js` |
| Cliq extension packaging | `.zoho/` (see that folder's own notes on what's confirmed vs. illustrative) |
| CI | `.github/workflows/` |

## Reporting issues

Use the repository's Issues tab for bugs and documentation gaps. Given this module's purpose, treat anything that looks like an actual authentication bypass, token leakage path, or `state` validation weakness as a security report rather than a routine bug, and consider whether it should be disclosed privately before being filed as a public issue.
