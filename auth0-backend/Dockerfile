# ZOHO-AUTH0 — production backend (Node.js)
# Handles OAuth token exchange and session storage. Deployed to Render
# in production; this image is for local parity testing and CI.

FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

# These four are required at runtime and are intentionally NOT baked
# into the image. Supply them via `docker run -e` / a .env file /
# your platform's secret manager. See docs/SETUP_AND_DEPLOYMENT.md.
ENV AUTH0_DOMAIN=""
ENV AUTH0_CLIENT_ID=""
ENV AUTH0_CLIENT_SECRET=""
ENV AUTH0_AUDIENCE=""
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/auth0/config || exit 1

CMD ["node", "server.js"]
