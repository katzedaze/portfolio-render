# Portfolio

フルスタックのポートフォリオ Web アプリケーション。管理者がプロジェクト・スキル・プロフィールを管理し、訪問者が閲覧できます。

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, SQLModel, Alembic, PyJWT, bcrypt |
| Database | PostgreSQL 17 |
| Infrastructure | Docker Compose |
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
│   │   └── dependencies/    # Auth guard
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
│   ├── Dockerfile           # Development
│   └── Dockerfile.prod      # Production (standalone)
├── docs/
│   ├── PLAN.md              # Architecture plan
│   ├── TASK.md              # Task tracking
│   └── DEPLOY.md            # Deployment guide
├── scripts/
│   └── e2e-test.sh          # E2E test script
├── docker-compose.yml
├── fly.toml                 # Fly.io config
├── render.yaml              # Render Blueprint
├── railway.json             # Railway config
└── .github/workflows/ci.yml # CI pipeline
```

## API Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | /api/auth/login | No | JWT token |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/projects | No | Published projects |
| GET | /api/projects/{id} | No | Project detail |
| POST | /api/projects | Yes | Create project |
| PATCH | /api/projects/{id} | Yes | Update project |
| DELETE | /api/projects/{id} | Yes | Delete project |
| GET | /api/skills | No | Skills list |
| POST | /api/skills | Yes | Create skill |
| PATCH | /api/skills/{id} | Yes | Update skill |
| DELETE | /api/skills/{id} | Yes | Delete skill |
| GET | /api/profile | No | Get profile |
| PUT | /api/profile | Yes | Update profile |
| POST | /api/contact | No | Submit message |
| GET | /api/contact | Yes | List messages |
| PATCH | /api/contact/{id}/read | Yes | Mark read |
| DELETE | /api/contact/{id} | Yes | Delete message |
| POST | /api/upload | Yes | Upload file |
| GET | /api/health | No | Health check |

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
| `/admin` | Dashboard |
| `/admin/projects` | Project management |
| `/admin/projects/new` | Create project |
| `/admin/projects/[id]/edit` | Edit project |
| `/admin/skills` | Skill management |
| `/admin/profile` | Edit profile |
| `/admin/contact-messages` | Message inbox |

## Development

### Run Tests

```bash
# Frontend
cd frontend && bun run test

# Backend
cd backend && python -m pytest -m "not integration"

# Backend (with integration tests - requires MailHog)
cd backend && python -m pytest

# E2E (requires docker compose up)
bash scripts/e2e-test.sh
```

### Type Check

```bash
cd frontend && bun run typecheck
```

## Deployment

See [docs/DEPLOY.md](docs/DEPLOY.md) for full deployment instructions.

| Component | Platform | Config |
| --- | --- | --- |
| Frontend | Vercel | `frontend/vercel.json` |
| Backend | Render | `render.yaml` (includes DB) |
| Backend | Fly.io | `fly.toml` |
| Backend | Railway | `railway.json` |

## License

Private
