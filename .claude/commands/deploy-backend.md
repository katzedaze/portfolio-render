---
allowed-tools: Bash, Read, Glob, Grep
description: Deploy backend to Fly.io (production)
---

## Backend Deploy to Fly.io

Deploy the FastAPI backend to Fly.io production.

### Pre-deploy checks

1. Run backend tests:

   ```bash
   cd /home/katzedaze/workspace/portfolio && make backend-test
   ```

2. Ensure all changes are committed and pushed:

   ```bash
   cd /home/katzedaze/workspace/portfolio && git status
   ```

   If there are uncommitted changes, warn the user and stop.

### Deploy

```bash
cd /home/katzedaze/workspace/portfolio && fly deploy --app portfolio-backend-little-morning-3672
```

### Post-deploy verification

1. Health check:

   ```bash
   curl -s https://portfolio-backend-little-morning-3672.fly.dev/api/health
   ```

2. Login test:

   ```bash
   curl -s -X POST https://portfolio-backend-little-morning-3672.fly.dev/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"ChangeMeNow123"}' \
     -w "\nHTTP: %{http_code}\n"
   ```

3. Check logs if something went wrong:

   ```bash
   fly logs --app portfolio-backend-little-morning-3672
   ```

### Key reminders

- `redirect_slashes=False` is set — route definitions must use `""` not `"/"`
- `DATABASE_URL` with `postgres://` scheme is auto-converted to `postgresql://`
- Login endpoint expects JSON `{"email":"...","password":"..."}`, not form-urlencoded
- Admin user is seeded on startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars
- New routes require both backend deploy (Fly.io) AND frontend deploy (Vercel) if the frontend calls them
