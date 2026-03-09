---
allowed-tools: Bash, Read, Glob, Grep
description: Deploy both frontend (Vercel) and backend (Fly.io) to production
---

## Full Deploy (Backend + Frontend)

Deploy both services to production. Backend must be deployed first if there are new API endpoints.

### Pre-deploy checks

1. Run all tests:

   ```bash
   cd /home/katzedaze/workspace/portfolio && make ci
   ```

   If `make ci` is not available, run individually:

   ```bash
   make backend-test && make frontend-test && make frontend-typecheck
   ```

2. Ensure all changes are committed and pushed:

   ```bash
   cd /home/katzedaze/workspace/portfolio && git status && git log --oneline -3
   ```

   If there are uncommitted changes, warn the user and stop.

### Step 1: Deploy Backend (Fly.io)

```bash
cd /home/katzedaze/workspace/portfolio && fly deploy --app portfolio-backend-little-morning-3672
```

Verify backend:

```bash
curl -s https://portfolio-backend-little-morning-3672.fly.dev/api/health
```

### Step 2: Deploy Frontend (Vercel)

Git push triggers auto-deploy. If code is already pushed, force deploy:

```bash
cd /home/katzedaze/workspace/portfolio && vercel --prod --yes
```

Wait for build to complete:

```bash
sleep 60 && vercel ls 2>&1 | head -6
```

### Step 3: End-to-end verification

```bash
# Health check via Vercel proxy
curl -s https://portfolio-render-eight.vercel.app/api/health

# Login test via Vercel proxy
curl -s -X POST https://portfolio-render-eight.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMeNow123"}' \
  -w "\nHTTP: %{http_code}\n"

# Public API test
curl -s https://portfolio-render-eight.vercel.app/api/projects -w "\nHTTP: %{http_code}\n"
curl -s https://portfolio-render-eight.vercel.app/api/skills -w "\nHTTP: %{http_code}\n"
curl -s https://portfolio-render-eight.vercel.app/api/profile -w "\nHTTP: %{http_code}\n"
```

### Deployment URLs

| Service | URL |
| --- | --- |
| Frontend | <https://portfolio-render-eight.vercel.app> |
| Backend | <https://portfolio-backend-little-morning-3672.fly.dev> |
| Swagger UI | <https://portfolio-backend-little-morning-3672.fly.dev/docs> |
