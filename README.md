# ZOHO-AUTH0: Auth0 Integration Module

## Overview

This module implements a secure authentication layer using Auth0, designed for integration with Zoho Cliq and backend services. The architecture follows a decoupled approach, separating client-side orchestration from backend authentication and session management.

#### View ZOHO-AUTH0 Walk-Through: [ZOHO-AUTH0](https://vimeo.com/1179955289?share=copy&fl=sv&fe=ci)

<img width="1536" height="1024" alt="SNIPER" src="https://github.com/user-attachments/assets/0851b719-659f-4bc6-bccc-aeb97ba11af9" />

---

## Project Structure

```
auth0-main/
│
├── auth_layer.dg        # Deluge: Handles Auth0 login and access control
├── ai_layer.dg          # Deluge: Handles post-authentication AI interaction
├── auth0_server.py      # FastAPI: Auth0 token exchange and validation (testing)
│
auth0-backend/
│
├── server.js            # Node.js backend for token and session handling
├── package.json         # Project dependencies and scripts
```

---

## Architecture Overview

### Auth Layer (Zoho Cliq - Deluge)

* Initiates Auth0 login flow
* Redirects users to authenticate
* Verifies session via backend endpoints
* Restricts access for unauthenticated users

### AI Layer (Zoho Cliq - Deluge)

* Executes only after authentication is verified
* Sends user queries to the AI processing endpoint
* Returns responses to the user interface

### Backend Layer (Render Deployment)

* Handles OAuth token exchange with Auth0
* Stores and manages user sessions
* Provides endpoints for authentication verification

---

## Workflow

1. User initiates login from Zoho Cliq
2. Auth layer generates Auth0 authorization URL
3. User completes authentication via Auth0
4. Auth0 redirects to backend callback endpoint
5. Backend exchanges authorization code for access token
6. Token is stored and mapped to user_id
7. Client verifies authentication using `/check-token`
8. Upon verification, AI layer processes user queries

---

## FastAPI Server (Testing Layer)

The `auth0_server.py` file provides a testing implementation with the following endpoints:

* `/auth0/config` — Returns Auth0 configuration details
* `/auth0/callback` — Handles OAuth callback and token exchange
* `/check-token` — Verifies authentication status
* `/secure-data` — Sample protected endpoint

Note: This implementation uses in-memory storage and is intended for testing purposes only.

---

## Backend Deployment (Render)

The `auth0-backend` directory contains the production backend service.

### Deployment Steps

1. Push the `auth0-backend` directory to a repository
2. Create a new Web Service on Render
3. Connect the repository
4. Configure environment variables:

   * AUTH0_DOMAIN
   * AUTH0_CLIENT_ID
   * AUTH0_CLIENT_SECRET
   * AUTH0_AUDIENCE
5. Deploy the service

---

## Security Considerations

* Uses OAuth 2.0 Authorization Code Flow
* The `state` parameter maps authentication to user_id
* Sensitive credentials are handled only in the backend
* Deluge scripts do not expose secrets

---

## Disclaimer

This module is part of SNIPER Engine Beta v1 and represents a prototype-level implementation.
The code provided via repository or distribution packages is intentionally simplified to demonstrate functionality while protecting core architectural design elements.

---

### Zoho Cliq App Installation Guide [SNIPER ENGINE]

1. Click the provided install link [`installapp.do?id=`](https://cliq.zoho.com/installapp.do?id=8501) to open the app installation page in Zoho Cliq.
2. Follow the on-screen steps to install and authorize the extension for your workspace.
3. If access is restricted, ensure the app has been published (if developed from the GitHub code provided by the developer) or request the admin to enable it for your organization.

---

## Usage Context

This module is designed for:

* Zoho Cliq bot integrations
* Secure AI-driven workflows
* SaaS authentication systems
* Modular AI and authentication pipelines
