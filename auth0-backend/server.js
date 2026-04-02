import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== In-memory token store (hackathon use) =====
const tokenVault = new Map();

/************************************************************
  AUTH0 CONFIG (SET THESE IN RENDER ENV VARIABLES)
************************************************************/
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

/************************************************************
  CALLBACK ROUTE (Auth0 redirects here)
************************************************************/
app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const user = req.query.state; // we passed user_id here

    if (!code) {
      return res.send("No code received");
    }

    // Exchange code for token
    const tokenResponse = await axios.post(
      `https://${AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const tokenData = tokenResponse.data;

    // Store token in vault
    tokenVault.set(user, {
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      created_at: Date.now()
    });

    res.send("Login successful. You can return to Zoho Cliq.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("Error during authentication");
  }
});

/************************************************************
  GET TOKEN ROUTE (Called by Deluge)
************************************************************/
app.get("/get-token", (req, res) => {
  const user = req.query.user;

  if (!tokenVault.has(user)) {
    return res.json({});
  }

  const tokenData = tokenVault.get(user);

  res.json({
    access_token: tokenData.access_token
  });
});

/************************************************************
  ROOT
************************************************************/
app.get("/", (req, res) => {
  res.send("Auth0 Token Vault Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});