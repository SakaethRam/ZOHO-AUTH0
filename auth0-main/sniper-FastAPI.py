"""
SNIPER βeta v.1 — AUTH0 FASTAPI TEST SERVER

============================================================
WORKFLOW DEMONSTRATION:

1. Client (Zoho Cliq Bot) calls:
   → /auth0/config?user_id=XYZ
   → Receives Auth0 configuration (domain, client_id, redirect_uri)

2. User initiates login:
   → Redirects to Auth0 /authorize URL (handled client-side)

3. After successful login:
   → Auth0 redirects back with ?code=AUTH_CODE&state=user_id

4. Backend handles callback:
   → /auth0/callback
   → Exchanges AUTH_CODE for access_token
   → Stores token mapped to user_id

5. Client verifies session:
   → /check-token?user_id=XYZ
   → Returns { authenticated: true/false }

============================================================
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import requests
import os

app = FastAPI()

# =========================================================
# CONFIG (Use ENV in production)
# =========================================================
AUTH0_DOMAIN = "your-auth0-domain.auth0.com"
AUTH0_CLIENT_ID = "YOUR_CLIENT_ID"
AUTH0_CLIENT_SECRET = "YOUR_CLIENT_SECRET"
AUTH0_AUDIENCE = "YOUR_API_AUDIENCE"
REDIRECT_URI = "http://localhost:8000/auth0/callback"

# =========================================================
# IN-MEMORY TOKEN STORE (Testing only)
# =========================================================
user_tokens = {}

# =========================================================
# 1. PROVIDE CONFIG TO CLIENT
# =========================================================
@app.get("/auth0/config")
def get_auth0_config(user_id: str):
    return {
        "domain": AUTH0_DOMAIN,
        "client_id": AUTH0_CLIENT_ID,
        "audience": AUTH0_AUDIENCE,
        "redirect_uri": REDIRECT_URI
    }

# =========================================================
# 2. AUTH0 CALLBACK HANDLER
# =========================================================
@app.get("/auth0/callback")
def auth0_callback(code: str, state: str):
    """
    state = user_id passed during login
    """

    token_url = f"https://{AUTH0_DOMAIN}/oauth/token"

    payload = {
        "grant_type": "authorization_code",
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }

    headers = {"Content-Type": "application/json"}

    token_resp = requests.post(token_url, json=payload, headers=headers)

    if token_resp.status_code != 200:
        return JSONResponse(
            status_code=400,
            content={"error": "Token exchange failed"}
        )

    token_data = token_resp.json()

    # Store token mapped to user_id (state)
    user_tokens[state] = token_data

    return {
        "message": "Authentication successful",
        "user_id": state
    }

# =========================================================
# 3. CHECK AUTHENTICATION STATUS
# =========================================================
@app.get("/check-token")
def check_token(user_id: str):
    if user_id in user_tokens:
        return {
            "authenticated": True
        }
    return {
        "authenticated": False
    }

# =========================================================
# 4. OPTIONAL: PROTECTED TEST ENDPOINT
# =========================================================
@app.get("/secure-data")
def secure_data(user_id: str):
    if user_id not in user_tokens:
        return JSONResponse(
            status_code=401,
            content={"error": "Unauthorized"}
        )

    return {
        "data": "This is protected data accessible only after authentication."
    }

# =========================================================
# RUN INSTRUCTIONS
# =========================================================
"""
Run server:
uvicorn main:app --reload

Test flow:
1. GET /auth0/config?user_id=test123
2. Use returned config to construct Auth0 login URL
3. Complete login → redirected to /auth0/callback
4. GET /check-token?user_id=test123
5. Access /secure-data?user_id=test123
"""