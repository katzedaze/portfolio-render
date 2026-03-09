---
allowed-tools: Bash, Read, Glob, Grep
description: Deploy frontend to Vercel (production)
---

## Frontend Deploy to Vercel

Deploy the Next.js frontend to Vercel production.

### Pre-deploy checks

1. Run TypeScript type check (excluding test files):

   ```bash
   cd /home/katzedaze/workspace/portfolio && make frontend-typecheck
   ```

   If test-only errors exist, proceed anyway.

2. Run frontend tests:

   ```bash
   cd /home/katzedaze/workspace/portfolio && make frontend-test
   ```

3. Ensure all changes are committed and pushed:

   ```bash
   cd /home/katzedaze/workspace/portfolio && git status
   ```

   If there are uncommitted changes, warn the user and stop.

### Deploy

Push to main triggers auto-deploy. If manual deploy is needed:

```bash
cd /home/katzedaze/workspace/portfolio && vercel --prod --yes
```

### Post-deploy verification

1. Check deployment status:

   ```bash
   vercel ls 2>&1 | head -6
   ```

2. Verify the site is accessible:

   ```bash
   curl -s https://portfolio-render-eight.vercel.app/api/health -w "\nHTTP: %{http_code}\n"
   ```

3. Verify JS bundles don't contain hardcoded backend URLs:

   ```bash
   for chunk in $(curl -s https://portfolio-render-eight.vercel.app/ | grep -oP '/_next/static/chunks/[^"]+' | sort -u); do
     result=$(curl -s "https://portfolio-render-eight.vercel.app${chunk}" | grep -o 'localhost:8000')
     if [ -n "$result" ]; then echo "WARNING: Found localhost in ${chunk}"; fi
   done
   echo "Bundle check complete"
   ```

### Key reminders

- `NEXT_PUBLIC_API_URL` is baked in at build time — changing it requires redeploy
- Browser API calls MUST use relative paths (empty BASE_URL) — never reference NEXT_PUBLIC_API_URL in client code
- `.vercel/` directory must be at project root, not inside `frontend/`
