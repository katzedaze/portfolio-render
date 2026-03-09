# Portfolio

フルスタックのポートフォリオ Web アプリケーション。管理者がプロジェクト・スキル・プロフィールを管理し、訪問者が閲覧できます。

## Live

| Service | Platform | URL |
| --- | --- | --- |
| Frontend | Vercel | <https://portfolio-render-eight.vercel.app> |
| Backend API | Fly.io | <https://portfolio-backend-little-morning-3672.fly.dev> |
| Swagger UI | Fly.io | <https://portfolio-backend-little-morning-3672.fly.dev/docs> |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Bun |
| Backend | FastAPI, SQLModel, Alembic, PyJWT, bcrypt, Python 3.13 |
| Database | PostgreSQL 17 |
| Infrastructure | Vercel (frontend), Fly.io (backend), Docker Compose (dev) |
| Testing | Vitest + Testing Library (frontend), pytest + httpx (backend) |
| CI | GitHub Actions (4 parallel jobs) |

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Git

### Setup

```bash
git clone <repository-url>
cd portfolio
cp .env.example .env
docker compose up --build
```

| Service | URL |
| --- | --- |
| Frontend | <http://localhost:3000> |
| Backend API | <http://localhost:8000> |
| Swagger UI | <http://localhost:8000/docs> |
| MailHog | <http://localhost:8025> |

初回起動時に `.env` の `ADMIN_EMAIL` / `ADMIN_PASSWORD` で管理者アカウントが自動作成されます。

## Project Structure

```text
portfolio/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, lifespan
│   │   ├── config.py        # pydantic-settings
│   │   ├── database.py      # SQLModel engine / session
│   │   ├── models/          # SQLModel models
│   │   ├── schemas/         # Request / Response schemas
│   │   ├── routers/         # API endpoints
│   │   └── dependencies/    # Auth guard (JWT)
│   ├── alembic/             # DB migrations
│   ├── tests/               # pytest tests
│   ├── Dockerfile           # Development
│   └── Dockerfile.prod      # Production (multi-stage)
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # UI / layout / feature components
│   │   ├── hooks/           # TanStack Query hooks
│   │   ├── lib/             # API client, auth, validations
│   │   ├── types/           # TypeScript types
│   │   └── test/            # Test setup & fixtures
│   ├── next.config.ts       # API rewrites, image config
│   ├── vercel.json          # Vercel build config
│   ├── Dockerfile           # Development
│   └── Dockerfile.prod      # Production (standalone)
├── docs/
│   ├── DEPLOY.md            # Deployment guide
│   ├── PLAN.md              # Architecture plan
│   └── TASK.md              # Task tracking
├── .claude/commands/        # Claude Code deploy commands
├── scripts/
│   └── e2e-test.sh          # E2E test script
├── docker-compose.yml
├── fly.toml                 # Fly.io config
├── render.yaml              # Render Blueprint
├── railway.json             # Railway config
└── .github/workflows/ci.yml # CI pipeline
```

## Commands

```bash
# Docker Compose
make up              # Start all services
make up-build        # Start with rebuild
make down            # Stop all services
make logs            # Tail all logs
make ci              # Run all CI checks locally

# Backend (runs inside Docker)
make backend-test          # Unit tests (excludes integration)
make backend-test-all      # All tests including integration (needs MailHog)
make backend-test-cov      # Tests with coverage
make db-migrate            # Run Alembic migrations
make db-revision MSG="add foo"  # Generate migration

# Frontend (runs inside Docker)
make frontend-test         # Vitest
make frontend-typecheck    # TypeScript check
make frontend-build        # Next.js production build
```

## API Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/login` | No | Admin login (JSON: email, password) |
| GET | `/api/auth/me` | Yes | Current admin user |
| GET | `/api/dashboard/stats` | Yes | Dashboard statistics |
| GET | `/api/projects` | No | Published projects (supports `?is_featured=true`) |
| GET | `/api/projects/admin` | Yes | All projects (including drafts) |
| GET | `/api/projects/{id}` | No | Single project |
| POST | `/api/projects` | Yes | Create project |
| PATCH | `/api/projects/{id}` | Yes | Update project |
| DELETE | `/api/projects/{id}` | Yes | Delete project |
| GET | `/api/skills` | No | All skills |
| POST | `/api/skills` | Yes | Create skill |
| PATCH | `/api/skills/{id}` | Yes | Update skill |
| DELETE | `/api/skills/{id}` | Yes | Delete skill |
| GET | `/api/profile` | No | Get profile |
| PUT | `/api/profile` | Yes | Create/update profile |
| POST | `/api/contact` | No | Submit contact message |
| GET | `/api/contact` | Yes | List contact messages |
| PATCH | `/api/contact/{id}/read` | Yes | Mark message as read |
| DELETE | `/api/contact/{id}` | Yes | Delete message |
| POST | `/api/upload` | Yes | Upload file |

## Pages

### Public

| Path | Description |
| --- | --- |
| `/` | Hero, featured projects, skills |
| `/projects` | Project list |
| `/projects/[id]` | Project detail (Markdown) |
| `/about` | Profile & skills |
| `/contact` | Contact form |
| `/login` | Admin login |

### Admin

| Path | Description |
| --- | --- |
| `/admin` | Dashboard (stats) |
| `/admin/projects` | Project management |
| `/admin/projects/new` | Create project |
| `/admin/projects/[id]/edit` | Edit project |
| `/admin/skills` | Skill management |
| `/admin/profile` | Edit profile |
| `/admin/contact-messages` | Message inbox |

## Deployment

See [docs/DEPLOY.md](docs/DEPLOY.md) for full deployment instructions.

### Architecture

```text
Browser  →  /api/* (relative path)  →  Vercel (Next.js rewrites)  →  Fly.io (FastAPI)  →  PostgreSQL
```

ブラウザからの API リクエストは相対パスで送信され、Next.js の rewrites がバックエンドにプロキシする。これにより CORS の問題を回避している。

### Quick Deploy

```bash
# Backend → Fly.io
fly deploy --app portfolio-backend-little-morning-3672

# Frontend → Vercel (auto-deploys on git push to main)
git push origin main

# Frontend → Vercel (manual)
vercel --prod --yes
```

### Claude Code Deploy Commands

```bash
/deploy-frontend    # Deploy frontend to Vercel with checks
/deploy-backend     # Deploy backend to Fly.io with checks
/deploy-all         # Deploy both services with E2E verification
```

### Environment Variables

| Variable | Service | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Frontend (Vercel) | Backend URL (rewrites proxy + SSR fetch) |
| `DATABASE_URL` | Backend (Fly.io) | PostgreSQL connection string |
| `SECRET_KEY` | Backend (Fly.io) | JWT signing key |
| `ADMIN_EMAIL` | Backend (Fly.io) | Admin login email |
| `ADMIN_PASSWORD` | Backend (Fly.io) | Admin login password |

### Deployment Platforms

| Component | Platform | Config |
| --- | --- | --- |
| Frontend | Vercel | `frontend/vercel.json`, `next.config.ts` |
| Backend (primary) | Fly.io | `fly.toml` |
| Backend (alt) | Render | `render.yaml` (includes DB) |
| Backend (alt) | Railway | `railway.json` |

## License

Private
