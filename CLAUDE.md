# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Docker Compose (primary workflow)

```bash
make up              # Start all services (docker compose up -d)
make up-build        # Start with rebuild
make down            # Stop all services
make logs            # Tail all logs
make logs-backend    # Tail backend logs only
make logs-frontend   # Tail frontend logs only
make ci              # Run all CI checks locally (backend-test + typecheck + frontend-test + build)
make e2e             # Run E2E test script (scripts/e2e-test.sh)
make clean           # Stop services and remove volumes
```

### Backend (Python 3.13 + FastAPI)

```bash
# Via Make (runs inside Docker)
make backend-test          # Unit tests (excludes integration)
make backend-test-all      # All tests including integration (needs MailHog)
make backend-test-cov      # Tests with coverage
make backend-shell         # Open bash in backend container

# Direct (inside container or local venv)
python -m pytest -m "not integration" -v
python -m pytest tests/test_auth.py -v          # Single test file
python -m pytest tests/test_auth.py::test_login  # Single test
```

### Frontend (Bun + Next.js 16)

```bash
# Via Make (runs inside Docker)
make frontend-test         # Vitest run
make frontend-typecheck    # TypeScript type check
make frontend-build        # Next.js production build
make frontend-shell        # Open shell in frontend container

# Direct (inside container or local)
cd frontend
bun run test                          # All tests
bun run test src/__tests__/lib/api    # Single test file
bun run test:watch                    # Watch mode
bun run typecheck
```

### Database

```bash
make db-migrate                        # alembic upgrade head
make db-revision MSG="add foo table"   # Generate migration
make db-shell                          # psql into PostgreSQL
```

## Architecture

### Overview

Fullstack portfolio app: **Next.js frontend** (Vercel) + **FastAPI backend** (Fly.io) + **PostgreSQL**.

Frontend calls backend via `/api/*` rewrite proxy defined in `next.config.ts`. Client code uses relative paths (`/api/...`); never hardcode backend URLs. In production, `NEXT_PUBLIC_API_URL` points to the deployed backend (baked in at build time).

### Backend

- **Entry**: `app/main.py` — CORS middleware, static file mounting for `/uploads`, lifespan event seeds admin user from env vars.
- **Auth**: JWT (PyJWT, HS256, 24h expiry) + bcrypt for passwords. `dependencies/auth.py` provides `AdminDep` for protecting routes.
- **Models**: All SQLModel models in `app/models/models.py`. Tables: Profile, Project, Skill, ProjectSkill (link), ContactMessage, AdminUser.
- **Routers**: `auth`, `projects`, `skills`, `profile`, `contact`, `dashboard`, `upload`, `health`. Admin project list at `/api/projects/admin` (returns all); public `/api/projects` returns only published.
- **Schemas**: Request/response models in `app/schemas/`. Uses `model_dump(exclude_unset=True)` for partial updates.
- **Database**: Tables created via `SQLModel.metadata.create_all` in lifespan (no versioned Alembic migrations yet). `postgres://` → `postgresql://` scheme auto-conversion in `database.py` and `alembic/env.py`.
- **Tests**: pytest with SQLite in-memory DB via dependency override. Integration tests (marked `@pytest.mark.integration`) require MailHog.

### Frontend

- **Routes**: Public (`/`, `/projects`, `/projects/[id]`, `/about`, `/contact`, `/login`) and Admin (`/admin/*` — dashboard, projects CRUD, skills, profile, contact-messages).
- **Data fetching**: TanStack Query v5 for all admin pages. Query key factory in `lib/queryKeys.ts`. Custom hooks in `hooks/*.ts` wrap useQuery/useMutation.
- **Forms**: react-hook-form + Zod schemas (`lib/validations/*.ts`) + shadcn/ui Form components.
- **Auth**: Token stored in localStorage. Admin layout has `useEffect` auth guard. API client (`lib/api.ts`) attaches `Authorization: Bearer` header.
- **UI**: shadcn/ui v3+ (uses `@base-ui/react` primitives, NOT Radix UI).
- **Markdown**: `@uiw/react-md-editor` (editor, dynamically imported with `ssr: false`) + `react-markdown` with `remark-gfm` + `highlight.js` (renderer).

### CI

GitHub Actions (`.github/workflows/ci.yml`) runs 4 parallel jobs: `backend-test`, `frontend-typecheck`, `frontend-test`, `frontend-build`.

### Deployment

- **Frontend**: Vercel with `vercel.json` at project root. Root directory set to `frontend/`.
- **Backend**: Fly.io with `fly.toml` (nrt region). Production Dockerfiles: `backend/Dockerfile.prod`, `frontend/Dockerfile.prod`.
- See `docs/DEPLOY.md` for full deployment guide and troubleshooting.

## Critical Gotchas

- **`from __future__ import annotations`**: NEVER use in SQLModel model files — breaks `Relationship()` at runtime.
- **bcrypt, not passlib**: passlib is incompatible with Python 3.13. Use `bcrypt` directly.
- **shadcn/ui v3+**: Built on `@base-ui/react`, not Radix UI. Don't install Radix packages.
- **`NEXT_PUBLIC_API_URL`**: Baked in at build time. Changing it requires a redeploy.
- **No trailing slashes**: FastAPI routes use `@router.get("")` not `@router.get("/")`.
- **MDEditor**: Must be dynamically imported with `ssr: false` to avoid hydration errors.
