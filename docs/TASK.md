# 実行タスク一覧

## Phase 1: インフラ基盤

- [x] `docker-compose.yml` 作成 (db, backend, frontend 3サービス構成)
- [x] `.env` / `.env.example` 作成
- [x] `.gitignore` 作成
- [x] `backend/Dockerfile` 作成 (python:3.13-slim + uv)
- [x] `frontend/Dockerfile` 作成 (oven/bun:1)
- [x] `uploads/` ディレクトリ作成

## Phase 2: バックエンド

### 2-1. プロジェクト初期化

- [x] `backend/pyproject.toml` 作成 (依存パッケージ定義)

### 2-2. コア設定

- [x] `app/config.py` — pydantic-settings による環境変数読み込み
- [x] `app/database.py` — engine / get_session / SessionDep
- [x] `app/main.py` — FastAPI app / CORS / ルーター登録 / lifespan

### 2-3. データベースモデル

- [x] `app/models/models.py` — Profile, Project, Skill, ProjectSkill, ContactMessage, AdminUser

### 2-4. スキーマ

- [x] `app/schemas/auth.py` — LoginRequest, TokenResponse, AdminUserResponse
- [x] `app/schemas/projects.py` — ProjectCreate, ProjectUpdate, ProjectResponse
- [x] `app/schemas/skills.py` — SkillCreate, SkillUpdate, SkillResponse
- [x] `app/schemas/profile.py` — ProfileUpdate, ProfileResponse
- [x] `app/schemas/contact.py` — ContactCreate, ContactResponse

### 2-5. 認証

- [x] `app/dependencies/auth.py` — JWT検証 / get_current_admin / AdminDep

### 2-6. APIルーター

- [x] `app/routers/auth.py` — POST /login, GET /me
- [x] `app/routers/projects.py` — CRUD (公開一覧 / 詳細 / 作成 / 更新 / 削除)
- [x] `app/routers/skills.py` — CRUD
- [x] `app/routers/profile.py` — GET / PUT (upsert)
- [x] `app/routers/contact.py` — POST (公開) / GET / PATCH read / DELETE
- [x] `app/routers/upload.py` — POST ファイルアップロード
- [x] `app/routers/health.py` — GET ヘルスチェック

### 2-7. Alembic

- [x] `alembic.ini` 作成
- [x] `alembic/env.py` 作成
- [x] `alembic/script.py.mako` 作成

## Phase 3: フロントエンド

### 3-1. プロジェクト初期化

- [x] Next.js プロジェクト作成 (create-next-app)
- [x] `next.config.ts` 設定

### 3-2. shadcn/ui セットアップ

- [x] shadcn/ui 初期化 (`bunx --bun shadcn@latest init`)
- [x] 必要な shadcn/ui コンポーネントのインストール (button, card, input, label, dialog, badge, textarea, select, dropdown-menu, table, separator, skeleton, toast, alert, form, navigation-menu, sheet, avatar, tabs, tooltip)

### 3-3. Zod バリデーション導入

- [x] `zod`, `react-hook-form`, `@hookform/resolvers` パッケージインストール
- [x] `src/lib/validations/auth.ts` — ログインフォームスキーマ
- [x] `src/lib/validations/project.ts` — プロジェクトフォームスキーマ
- [x] `src/lib/validations/skill.ts` — スキルフォームスキーマ
- [x] `src/lib/validations/profile.ts` — プロフィールフォームスキーマ
- [x] `src/lib/validations/contact.ts` — 問い合わせフォームスキーマ

### 3-4. 共通ライブラリ

- [x] `src/types/index.ts` — TypeScript型定義
- [x] `src/lib/api.ts` — fetch ラッパー
- [x] `src/lib/auth.ts` — 認証ユーティリティ

### 3-5. UIコンポーネント (shadcn/ui ベース)

- [x] Button — shadcn/ui Button
- [x] Card — shadcn/ui Card
- [x] Input — shadcn/ui Input + Label
- [x] Dialog — shadcn/ui Dialog
- [x] Badge — shadcn/ui Badge
- [x] Skeleton — shadcn/ui Skeleton

### 3-6. レイアウトコンポーネント

- [x] Header — shadcn/ui NavigationMenu + Sheet (モバイルメニュー)
- [x] Footer — shadcn/ui Separator 等を活用
- [x] AdminSidebar — shadcn/ui Sheet + NavigationMenu

### 3-7. 公開ページ

- [x] `/` — ホームページ (ヒーロー / 注目プロジェクト / スキル)
- [x] `/projects` — プロジェクト一覧
- [x] `/projects/[id]` — プロジェクト詳細
- [x] `/about` — プロフィール / スキル
- [x] `/contact` — 問い合わせフォーム (react-hook-form + Zod)
- [x] `/login` — ログインフォーム (react-hook-form + Zod)

### 3-8. 管理者ページ

- [x] `/admin` — ダッシュボード
- [x] `/admin/projects` — プロジェクト管理テーブル (Table, DropdownMenu, Dialog)
- [x] `/admin/projects/new` — プロジェクト作成 (react-hook-form + Zod + shadcn/ui Form)
- [x] `/admin/projects/[id]/edit` — プロジェクト編集 (react-hook-form + Zod + shadcn/ui Form)
- [x] `/admin/skills` — スキル管理 (Table, Dialog, Form)
- [x] `/admin/profile` — プロフィール編集 (react-hook-form + Zod + shadcn/ui Form)
- [x] `/admin/contact-messages` — メッセージ一覧 (Table, Badge, Dialog)

### 3-9. 機能コンポーネント

- [x] ProjectCard / ProjectGrid
- [x] SkillBadge / SkillList
- [x] ProfileView / ProfileForm
- [x] ContactForm (react-hook-form + Zod バリデーション)
- [x] ProjectForm (react-hook-form + Zod バリデーション)

## Phase 4: 仕上げ

- [x] 画像アップロード統合 (ProjectForm / ProfileForm)
- [x] ローディング / エラー / 空状態の表示
- [x] レスポンシブデザイン対応
- [x] Next.js metadata (各ページのタイトル・description)
- [x] `docker compose up --build` で全サービス起動確認
- [x] Swagger UI (`http://localhost:8000/docs`) でAPI動作確認
- [x] フロントエンド (`http://localhost:3000`) 画面表示確認
- [x] E2Eテスト: 管理者ログイン → プロジェクト作成 → 公開ページ表示
- [x] pytest + httpx でバックエンドAPIテスト作成

---

## Phase 5: TanStack Query 導入

### 5-1. セットアップ

- [x] `@tanstack/react-query` / `@tanstack/react-query-devtools` インストール
- [x] `src/components/providers/QueryProvider.tsx` 作成 (staleTime: 30s, retry: 1)
- [x] Admin Layout に `<QueryProvider>` ラップ

### 5-2. クエリキー・カスタムフック

- [x] `src/lib/queryKeys.ts` — projects, skills, profile, contactMessages, dashboard
- [x] `src/hooks/useProjects.ts` — useProjects / useProject / useCreateProject / useUpdateProject / useDeleteProject
- [x] `src/hooks/useSkills.ts` — useSkills / useCreateSkill / useUpdateSkill / useDeleteSkill
- [x] `src/hooks/useProfile.ts` — useProfile / useUpdateProfile
- [x] `src/hooks/useContactMessages.ts` — useContactMessages / useMarkMessageRead (楽観的更新) / useDeleteMessage
- [x] `src/hooks/useDashboardStats.ts` — useDashboardStats

### 5-3. 管理ページのリファクタリング (useState+useEffect → TanStack Query)

- [x] `/admin` ダッシュボード — `useDashboardStats()`
- [x] `/admin/projects` — `useProjects()` / `useDeleteProject()`
- [x] `/admin/skills` — `useSkills()` / CRUD mutations
- [x] `/admin/profile` — `useProfile()` / `useUpdateProfile()`
- [x] `/admin/contact-messages` — `useContactMessages()` / mutations
- [x] `ProjectForm.tsx` — スキル取得を `useSkills()` に

---

## Phase 6: 画像アップロード強化

### 6-1. ImageUpload コンポーネント

- [x] `src/components/ui/ImageUpload.tsx` — D&D / クリック選択 / プレビュー / 削除 / サイズ・タイプバリデーション

### 6-2. フォーム統合

- [x] `ProjectForm.tsx` — thumbnail セクションを `<ImageUpload>` に置換
- [x] `ProfileForm.tsx` — avatar セクションを `<ImageUpload>` に置換

### 6-3. バックエンドファイルサイズ制限

- [x] `backend/app/routers/upload.py` — 5MB上限、超過で HTTP 413
- [x] `backend/app/routers/admin.py` — 該当なし (アップロードは upload.py に集約済み)

---

## Phase 7: Markdown エディタ & レンダリング

### 7-1. ライブラリインストール

- [x] `@uiw/react-md-editor`, `react-markdown`, `remark-gfm`, `rehype-highlight`, `@tailwindcss/typography`

### 7-2. 管理画面: Markdown エディタ

- [x] `ProjectForm.tsx` — content textarea を `@uiw/react-md-editor` に置換 (動的インポート / ライブプレビュー)

### 7-3. 公開ページ: 安全な Markdown レンダリング

- [x] `src/components/ui/MarkdownRenderer.tsx` — react-markdown + remark-gfm + rehype-highlight
- [x] `app/projects/[id]/page.tsx` — `dangerouslySetInnerHTML` を `<MarkdownRenderer>` に置換 (XSS修正)

### 7-4. シンタックスハイライト CSS

- [x] `globals.css` — highlight.js テーマ CSS インポート

---

## Phase 8: テスト

### 8-1. フロントエンドテスト環境セットアップ

- [x] `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@vitejs/plugin-react`, `jsdom` インストール
- [x] `frontend/vitest.config.ts` — jsdom 環境 / `@/` alias / setupFiles
- [x] `frontend/src/test/setup.ts` — `@testing-library/jest-dom/vitest` インポート
- [x] `frontend/src/test/utils.tsx` — `renderWithProviders` (QueryClientProvider 付き)
- [x] `frontend/src/test/fixtures.ts` — テストデータファクトリ
- [x] `frontend/package.json` — `test`, `test:watch`, `test:coverage`, `typecheck` スクリプト追加

### 8-2. フロントエンド Unit Tests

- [x] `__tests__/lib/api.test.ts` — fetch wrapper (auth header / エラーハンドリング)
- [x] `__tests__/lib/auth.test.ts` — login / logout / getToken / isAuthenticated
- [x] `__tests__/components/ui/Button.test.tsx` — レンダリング / クリック / loading
- [x] `__tests__/components/ui/Input.test.tsx` — ラベル / 変更 / エラー表示
- [x] `__tests__/components/ui/ImageUpload.test.tsx` — D&D / バリデーション / プレビュー
- [x] `__tests__/components/ui/MarkdownRenderer.test.tsx` — Markdown→HTML 変換

### 8-3. フロントエンド Hook Tests

- [x] `__tests__/hooks/useProjects.test.ts` — クエリ・データ取得
- [x] `__tests__/hooks/useSkills.test.ts` — クエリ・データ取得
- [x] `__tests__/hooks/useProfile.test.ts` — クエリ・データ取得
- [x] `__tests__/hooks/useContactMessages.test.ts` — クエリ・データ取得

### 8-4. フロントエンド結合テスト

- [x] `__tests__/pages/admin/dashboard.test.tsx` — 統計表示 / ローディング
- [x] `__tests__/pages/admin/projects.test.tsx` — プロジェクト一覧 / ステータス表示
- [x] `__tests__/pages/admin/skills.test.tsx` — スキル一覧 / カテゴリグループ
- [x] `__tests__/pages/admin/profile.test.tsx` — プロフィール編集フォーム
- [x] `__tests__/pages/admin/contact-messages.test.tsx` — メッセージ一覧 / 未読数
- [x] `__tests__/components/contact/ContactForm.test.tsx` — バリデーション / 送信

### 8-5. バックエンドテスト強化

- [x] `backend/pyproject.toml` — `pytest-cov` 追加 / `markers` 設定
- [x] `backend/tests/test_upload_validation.py` — ファイルサイズ超過で 413 テスト

### 8-6. MailHog 結合テスト

- [x] `backend/tests/integration/conftest.py` — SMTP_HOST=localhost / MailHogクリア
- [x] `backend/tests/integration/test_email.py` — MailHog API で受信確認 / E2E テスト

---

## Phase 9: CI/CD & デプロイ

### 9-1. GitHub Actions CI

- [x] `.github/workflows/ci.yml` — 4ジョブ並行 (backend-test / frontend-build / frontend-typecheck / frontend-test)

### 9-2. Vercel デプロイ設定

- [x] `frontend/next.config.ts` — `remotePatterns` に本番ホスト追加 (環境変数ベース)
- [x] `frontend/vercel.json` — Vercel 設定ファイル (bun install / bun run build)
- [x] `frontend/Dockerfile.prod` — 本番用マルチステージビルド (standalone 出力)
- [x] `next.config.ts` — `output: "standalone"` 追加
- [x] Vercel ダッシュボードで Root Directory を `frontend/` に設定
- [x] 環境変数 `NEXT_PUBLIC_API_URL` を本番バックエンド URL に設定

### 9-3. バックエンドデプロイ

- [x] `backend/Dockerfile.prod` — 本番用マルチステージビルド (alembic migrate + uvicorn)
- [x] `fly.toml` — Fly.io 設定 (nrt リージョン / ヘルスチェック / ボリューム)
- [x] `render.yaml` — Render Blueprint (バックエンド + マネージド PostgreSQL)
- [x] `railway.json` — Railway 設定 (Dockerfile ビルド / ヘルスチェック)
- [x] Fly.io にバックエンドをデプロイ (<https://portfolio-backend-little-morning-3672.fly.dev>)
- [x] 本番 DB (マネージド PostgreSQL) 設定
- [x] 環境変数設定 (DATABASE_URL, SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD 等)
