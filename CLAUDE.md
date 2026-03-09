# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Docker Compose (primary workflow)

```bash
make up              # Start all services (docker compose up -d)
make up-build        # Start with rebuild
make down            # Stop all services
make logs            # Tail all logs
make ci              # Run all CI checks locally (backend-test + typecheck + frontend-test + build)
```

### Backend (Python 3.13 + FastAPI)

```bash
# Via Make (runs inside Docker)
make backend-test          # Unit tests (excludes integration)
make backend-test-all      # All tests including integration (needs MailHog)
make backend-test-cov      # Tests with coverage

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

Fullstack portfolio app: **Next.js frontend** (Vercel) + **FastAPI backend** (Fly.io/Render/Railway) + **PostgreSQL**.

Frontend calls backend via `/api/*` rewrite proxy defined in `next.config.ts`. In production, `NEXT_PUBLIC_API_URL` points to the deployed backend.

### Backend

- **Auth**: JWT (PyJWT, HS256, 24h expiry) + bcrypt for passwords. Admin user seeded from env vars on startup via lifespan event.
- **Dependency injection**: `SessionDep` (DB session) and `AdminDep` (authenticated admin) are injected into route handlers.
- **Models**: All SQLModel models in single file `app/models/models.py`. Many-to-many: `Project <-> Skill` via `ProjectSkill` link table.
- **Tests**: pytest with SQLite in-memory DB via dependency override. Integration tests (marked `@pytest.mark.integration`) require MailHog.

### Frontend

- **Data fetching**: TanStack Query (React Query v5) for all admin pages. Query key factory in `lib/queryKeys.ts`. Custom hooks in `hooks/*.ts` wrap useQuery/useMutation.
- **Forms**: react-hook-form + Zod schemas (`lib/validations/*.ts`) + shadcn/ui Form components.
- **Auth**: Token stored in localStorage. Admin routes protected by layout-level `useEffect` check. API client in `lib/api.ts` attaches `Authorization: Bearer` header.
- **UI**: shadcn/ui v3+ (uses `@base-ui/react` primitives, NOT Radix UI).

### CI

GitHub Actions runs 4 parallel jobs: `backend-test`, `frontend-typecheck`, `frontend-test`, `frontend-build`.

## Critical Gotchas

- **`from __future__ import annotations`**: NEVER use in SQLModel model files — breaks `Relationship()` at runtime.
- **bcrypt, not passlib**: passlib is incompatible with Python 3.13. Use `bcrypt` directly.
- **shadcn/ui v3+**: Built on `@base-ui/react`, not Radix UI. Don't install Radix packages.
- **`NEXT_PUBLIC_API_URL`**: Baked in at build time. Changing it requires a redeploy.
