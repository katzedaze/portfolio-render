# ポートフォリオWebアプリ実装計画

## Context

ポートフォリオサイトの管理・閲覧ができるWebアプリを構築する。管理者がプロジェクト・スキル・プロフィールをCRUD管理し、訪問者が閲覧できるフルスタックアプリケーション。

**技術スタック:**

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- UI コンポーネント: shadcn/ui v3+ (@base-ui/react ベース、Radix UI は不使用)
- バリデーション: Zod (フォームバリデーション + 型安全なスキーマ定義)
- Runtime: Bun (oven/bun:1 Docker image)
- Backend: FastAPI + SQLModel + Alembic
- Database: PostgreSQL 17
- Infrastructure: Docker Compose

---

## Phase 1: インフラ基盤

### 1-1. ルートファイル作成

- `docker-compose.yml` — 3サービス構成 (db, backend, frontend)
- `.env` / `.env.example` — 環境変数
- `.gitignore`

### 1-2. Docker Compose設計

```yaml
services:
  db:
    image: postgres:17-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    ports: ["5432:5432"]
    healthcheck: pg_isready

  backend:
    build: ./backend
    volumes:
      - ./backend/app:/code/app      # ホットリロード
      - ./uploads:/code/uploads       # アップロードファイル
    ports: ["8000:8000"]
    depends_on: { db: service_healthy }
    command: fastapi dev app/main.py --host 0.0.0.0

  frontend:
    build: ./frontend
    volumes: [./frontend/src:/app/src]  # ホットリロード
    ports: ["3000:3000"]
    depends_on: [backend]
    command: bun run dev
```

### 1-3. Dockerfile

- **Backend**: `python:3.13-slim` マルチステージ、uv でパッケージ管理
- **Frontend**: `oven/bun:1` マルチステージ、`bun install --frozen-lockfile`

---

## Phase 2: バックエンド

### 2-1. プロジェクト初期化

- `pyproject.toml` — 依存: fastapi, sqlmodel, uvicorn, alembic, pyjwt, bcrypt, python-multipart, pydantic-settings, psycopg2-binary

### 2-2. コア設定

- `app/config.py` — pydantic-settings で環境変数読み込み
- `app/database.py` — engine作成、`SessionDep = Annotated[Session, Depends(get_session)]`
- `app/main.py` — FastAPI app、CORSMiddleware、ルーター登録、healthcheck

### 2-3. データベースモデル (SQLModel)

| テーブル | 主要カラム |
| --------- | ----------- |
| `profiles` | name, title, bio, avatar_url, email, github_url, linkedin_url |
| `projects` | title, slug, description, content, thumbnail_url, live_url, github_url, is_featured, is_published, sort_order |
| `skills` | name, category, proficiency(1-100), icon, sort_order |
| `project_skills` | project_id (FK), skill_id (FK) — 多対多 |
| `contact_messages` | name, email, subject, message, is_read |
| `admin_users` | email, hashed_password |

### 2-4. Alembic マイグレーション

- `alembic init alembic` → `env.py` で DATABASE_URL と SQLModel metadata を設定
- 初期マイグレーション生成

### 2-5. APIエンドポイント

| メソッド | パス | 認証 | 説明 |
| --------- | ------ | ----- | ------ |
| POST | /api/auth/login | No | JWT トークン発行 |
| GET | /api/auth/me | Yes | 現在のユーザー情報 |
| GET | /api/projects | No | 公開プロジェクト一覧 |
| GET | /api/projects/{id} | No | プロジェクト詳細 |
| POST | /api/projects | Yes | プロジェクト作成 |
| PATCH | /api/projects/{id} | Yes | プロジェクト更新 |
| DELETE | /api/projects/{id} | Yes | プロジェクト削除 |
| GET | /api/skills | No | スキル一覧 |
| POST | /api/skills | Yes | スキル作成 |
| PATCH | /api/skills/{id} | Yes | スキル更新 |
| DELETE | /api/skills/{id} | Yes | スキル削除 |
| GET | /api/profile | No | プロフィール取得 |
| PUT | /api/profile | Yes | プロフィール更新 |
| POST | /api/contact | No | 問い合わせ送信 |
| GET | /api/contact | Yes | メッセージ一覧(管理者) |
| PATCH | /api/contact/{id}/read | Yes | 既読マーク |
| DELETE | /api/contact/{id} | Yes | メッセージ削除 |
| POST | /api/upload | Yes | ファイルアップロード |
| GET | /api/health | No | ヘルスチェック |

### 2-6. 認証

- JWT (PyJWT, HS256, 24h expiry) + bcrypt (直接使用、passlib は Python 3.13 非対応)
- `get_current_admin` 依存関数
- lifespan イベントで初期管理者を環境変数からシード

---

## Phase 3: フロントエンド

### 3-1. プロジェクト初期化

```bash
bunx create-next-app@latest frontend --typescript --tailwind --app --src-dir --use-bun
```

### 3-2. shadcn/ui セットアップ

- `bunx --bun shadcn@latest init` — shadcn/ui 初期化 (components.json 生成)
- 必要コンポーネントのインストール:
  - `button`, `card`, `input`, `label`, `dialog`, `badge`, `textarea`, `select`, `dropdown-menu`, `table`, `separator`, `skeleton`, `toast`, `alert`, `form`, `navigation-menu`, `sheet`, `avatar`, `tabs`, `tooltip`
- `src/lib/utils.ts` — `cn()` ユーティリティ (shadcn/ui 標準)
- 既存の自作 UI コンポーネント (`ui/Button`, `ui/Card`, `ui/Input`, `ui/Modal`, `ui/Badge`, `ui/Spinner`) を shadcn/ui コンポーネントに置換

### 3-3. Zod バリデーション

- `zod` パッケージインストール
- `src/lib/validations/` — Zod スキーマ定義:
  - `auth.ts` — ログインフォーム (email, password)
  - `project.ts` — プロジェクト作成/編集 (title, description, content 等)
  - `skill.ts` — スキル作成/編集 (name, category, proficiency 等)
  - `profile.ts` — プロフィール編集 (name, title, bio 等)
  - `contact.ts` — 問い合わせフォーム (name, email, subject, message)
- 各フォームコンポーネントで Zod スキーマによるバリデーションを適用
- react-hook-form + @hookform/resolvers/zod でフォーム管理とバリデーションを統合

### 3-4. 共通ライブラリ

- `src/lib/api.ts` — fetch ラッパー (NEXT_PUBLIC_API_URL、auth ヘッダー、エラー処理)
- `src/lib/auth.ts` — login/logout/getToken/isAuthenticated
- `src/types/index.ts` — API スキーマに対応する TypeScript インターフェース

### 3-5. 公開ページ (Server Components)

| パス | 内容 |
| ------ | ------ |
| `/` | ヒーロー、注目プロジェクト、スキル概要 |
| `/projects` | プロジェクト一覧グリッド |
| `/projects/[id]` | プロジェクト詳細 (Markdown) |
| `/about` | プロフィール、スキル (カテゴリ別) |
| `/contact` | 問い合わせフォーム (Client Component) |
| `/login` | ログインフォーム |

### 3-6. 管理者ページ (Client Components + auth guard)

| パス | 内容 |
| ------ | ------ |
| `/admin` | ダッシュボード概要 |
| `/admin/projects` | プロジェクト一覧テーブル (CRUD) |
| `/admin/projects/new` | プロジェクト作成フォーム |
| `/admin/projects/[id]/edit` | プロジェクト編集フォーム |
| `/admin/skills` | スキル管理 (インライン編集) |
| `/admin/profile` | プロフィール編集 |
| `/admin/contact-messages` | 問い合わせメッセージ一覧 |

### 3-7. コンポーネント構成

```text
src/components/
├── ui/              — shadcn/ui コンポーネント (button, card, input, dialog, badge, skeleton 等)
├── layout/          — Header, Footer, AdminSidebar
├── projects/        — ProjectCard, ProjectGrid, ProjectDetail, ProjectForm
├── skills/          — SkillBadge, SkillList
├── profile/         — ProfileView, ProfileForm
└── contact/         — ContactForm
src/lib/
├── validations/     — Zod スキーマ (auth, project, skill, profile, contact)
└── utils.ts         — cn() ユーティリティ (shadcn/ui)
```

---

## Phase 4: 仕上げ

- 画像アップロード統合 (プロジェクト・プロフィールフォーム)
- ローディング/エラー/空状態の表示
- レスポンシブデザイン対応
- Next.js metadata (ページタイトル・description)

---

## ディレクトリ構造

```text
portfolio/
├── docker-compose.yml
├── .env / .env.example
├── .gitignore
├── docs/
│   ├── PLAN.md
│   └── TASK.md
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   └── src/
│       ├── app/          # ページ (App Router)
│       ├── components/   # UIコンポーネント
│       ├── lib/          # api.ts, auth.ts, utils.ts
│       └── types/        # TypeScript型定義
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── alembic/          # マイグレーション
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models/       # SQLModel定義
│       ├── schemas/      # リクエスト/レスポンス型
│       ├── routers/      # APIルーター
│       ├── dependencies/  # 認証ガード
│       └── services/     # ビジネスロジック
└── uploads/              # アップロードファイル (Docker volume)
```

---

## Phase 5: TanStack Query 導入

- `@tanstack/react-query` / `@tanstack/react-query-devtools` 導入
- `src/lib/queryKeys.ts` — クエリキーファクトリ
- `src/hooks/*.ts` — カスタムフック (useQuery/useMutation ラッパー)
- 全管理ページを useState+useEffect から TanStack Query v5 にリファクタリング

---

## Phase 6: 画像アップロード強化

- `src/components/ui/ImageUpload.tsx` — D&D / プレビュー / バリデーション
- ProjectForm / ProfileForm に統合
- バックエンド 5MB 上限 (HTTP 413)

---

## Phase 7: Markdown エディタ & レンダリング

- `@uiw/react-md-editor` (管理画面、動的インポート `ssr: false`)
- `react-markdown` + `remark-gfm` + `rehype-highlight` (公開ページ)
- `MarkdownRenderer` コンポーネントで XSS 対策

---

## Phase 8: テスト

- **フロントエンド**: Vitest + Testing Library (100+ テスト)
- **バックエンド**: pytest + httpx (24 ユニットテスト + 4 MailHog 結合テスト)
- **E2E**: `scripts/e2e-test.sh` (9 ステップ)

---

## Phase 9: CI/CD & デプロイ

- **CI**: GitHub Actions — 4 ジョブ並行 (backend-test / frontend-typecheck / frontend-test / frontend-build)
- **フロントエンド**: Vercel にデプロイ (`frontend/vercel.json`, Root Directory: `frontend/`)
- **バックエンド**: Fly.io にデプロイ (`fly.toml`, nrt リージョン, `backend/Dockerfile.prod`)
- **本番 URL**:
  - フロントエンド: <https://portfolio-render-eight.vercel.app>
  - バックエンド: <https://portfolio-backend-little-morning-3672.fly.dev>

---

## 検証方法

1. **Docker**: `docker compose up --build` で全サービス起動確認
2. **Backend**: `http://localhost:8000/docs` でSwagger UIからAPI動作確認
3. **Frontend**: `http://localhost:3000` で画面表示確認
4. **テスト**: pytest + httpx でバックエンドAPIテスト
5. **E2E**: 管理者ログイン → プロジェクト作成 → 公開ページで表示確認
