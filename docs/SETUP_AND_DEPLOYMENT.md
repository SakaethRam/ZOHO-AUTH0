# Setup and Deployment

## Backend deployment (Render)

The `auth0-backend` directory is the production backend service.

1. Push the `auth0-backend` directory to a repository (this can be the same repo or a dedicated one, as long as Render can point at it).
2. Create a new Web Service on Render.
3. Connect the repository.
4. Configure environment variables:
   - `AUTH0_DOMAIN`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - `AUTH0_AUDIENCE`
5. Deploy the service.

None of these four values should be committed to the repository; they belong in Render's environment variable configuration only. See `docker/` for a local-equivalent `.env` pattern.

## Zoho Cliq extension installation (SNIPER Engine)

1. Open the install link (`installapp.do?id=8501`) to start installation inside Zoho Cliq.
2. Follow the on-screen steps to install and authorize the extension for your workspace.
3. If access is restricted, either the app needs to be published (if built from this repository's code) or a workspace admin needs to enable it for your organization.

## Local testing with the FastAPI server

For iterating on the auth flow without a live Render deployment:

```bash
cd auth0-main
pip install fastapi uvicorn
uvicorn auth0_server:app --reload --port 8000
```

Point the Deluge auth layer's backend URL at this local server during development, and switch it back to the Render-deployed backend before distributing the extension. Because the FastAPI server uses in-memory storage (see `SECURITY.md`), restarting it clears all sessions, which is expected and fine for local iteration.

## Node.js backend, run locally

```bash
cd auth0-backend
npm install
AUTH0_DOMAIN=... AUTH0_CLIENT_ID=... AUTH0_CLIENT_SECRET=... AUTH0_AUDIENCE=... node server.js
```

Running the actual production backend locally (rather than the FastAPI stand-in) is the more faithful way to test right before a Render deploy, since it exercises the real session-storage code path.

## Environment variable reference

| Variable | Used by | Purpose |
|----------|---------|---------|
| `AUTH0_DOMAIN` | backend | The Auth0 tenant domain used to build authorization/token URLs. |
| `AUTH0_CLIENT_ID` | backend | Public identifier for the Auth0 application. |
| `AUTH0_CLIENT_SECRET` | backend only | Confidential secret used in the token exchange; never exposed to Deluge or the client. |
| `AUTH0_AUDIENCE` | backend | The API identifier the requested access token should be valid for. |

## Deployment checklist

- [ ] Auth0 application configured with the correct callback URL pointing at the Render backend's `/auth0/callback`.
- [ ] All four environment variables set in Render, not in code.
- [ ] Cliq extension's backend URL pointed at the Render deployment, not the local FastAPI test server.
- [ ] Extension published or explicitly enabled for the target workspace, per the install steps above.
