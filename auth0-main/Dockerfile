# ZOHO-AUTH0 — FastAPI test server (auth0-main)
# In-memory testing implementation of the same auth contract as the
# production Node.js backend. Not for production use — see
# docs/SECURITY.md, "Known limitation: the FastAPI test server".

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt* ./
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" \
    && if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

COPY . .

ENV AUTH0_DOMAIN=""
ENV AUTH0_CLIENT_ID=""
ENV AUTH0_CLIENT_SECRET=""
ENV AUTH0_AUDIENCE=""
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/auth0/config')" || exit 1

CMD ["uvicorn", "auth0_server:app", "--host", "0.0.0.0", "--port", "8000"]
