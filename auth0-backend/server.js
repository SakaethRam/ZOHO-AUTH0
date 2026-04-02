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
    const user = req.query.state;

    if (!code) {
      return res.send("No code received");
    }

    // Exchange code → token
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

    // Store token
    tokenVault.set(user, {
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      created_at: Date.now()
    });

    console.log("Token stored for user:", user);

    res.send("Login successful. You can return to Zoho Cliq.");
  } catch (err) {
    console.error("Auth Error:", err.response?.data || err.message);
    res.send("Error during authentication");
  }
});

/************************************************************
  CHECK TOKEN ROUTE (Used by Deluge)
************************************************************/
app.get("/check-token", (req, res) => {
  const user = req.query.user_id;

  if (!tokenVault.has(user)) {
    return res.json({ authenticated: false });
  }

  res.json({ authenticated: true });
});

/************************************************************
  GITHUB REPOS ROUTE (NEW)
************************************************************/
app.get("/github/repos", async (req, res) => {
  const user = req.query.user_id;

  if (!tokenVault.has(user)) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const tokenData = tokenVault.get(user);
  const token = tokenData.access_token;

  try {
    const githubResponse = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Optional: clean response
    const repos = githubResponse.data.map(repo => ({
      name: repo.name,
      url: repo.html_url
    }));

    res.json(repos);
  } catch (err) {
    console.error("GitHub API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "GitHub API failed" });
  }
});

/************************************************************
  OPTIONAL: GET TOKEN (DEBUG)
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
