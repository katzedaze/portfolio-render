# デプロイ手順

本プロジェクトは **フロントエンド (Next.js)** と **バックエンド (FastAPI)** を別々のサービスにデプロイする構成です。

## アーキテクチャ

```text
[Vercel]  ──  フロントエンド (Next.js)
   │
   │  NEXT_PUBLIC_API_URL
   ▼
[Fly.io / Render / Railway]  ──  バックエンド (FastAPI)
   │
   │  DATABASE_URL
   ▼
[マネージド PostgreSQL]
```

## 環境変数一覧

| 変数名 | 設定先 | 説明 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | フロントエンド | バックエンドの本番 URL |
| `DATABASE_URL` | バックエンド | PostgreSQL 接続文字列 |
| `SECRET_KEY` | バックエンド | JWT 署名用秘密鍵 (ランダム文字列) |
| `ADMIN_EMAIL` | バックエンド | 管理者ログインメール |
| `ADMIN_PASSWORD` | バックエンド | 管理者ログインパスワード |
| `SMTP_HOST` | バックエンド (任意) | メール通知用 SMTP ホスト |
| `SMTP_PORT` | バックエンド (任意) | SMTP ポート (デフォルト: 1025) |
| `NOTIFICATION_EMAIL` | バックエンド (任意) | 通知送信先メールアドレス |

---

## フロントエンド: Vercel

### Vercel 手順

1. [Vercel](https://vercel.com) にログインし、GitHub リポジトリを接続
2. インポート設定:
   - **Framework Preset**: Next.js (自動検出)
   - **Root Directory**: `frontend/`
   - **Build Command**: `bun run build` (vercel.json で自動設定済み)
   - **Install Command**: `bun install` (vercel.json で自動設定済み)
3. 環境変数を設定:
   - `NEXT_PUBLIC_API_URL` = バックエンドの本番 URL
4. 「Deploy」をクリック

### Vercel 設定ファイル

- `frontend/vercel.json` — ビルドコマンド定義
- `frontend/next.config.ts` — `output: "standalone"` / API リライト / 画像ホスト許可

### Vercel 注意事項

- `NEXT_PUBLIC_API_URL` はビルド時に埋め込まれるため、変更後は再デプロイが必要
- 画像最適化は Vercel が自動で処理する

---

## バックエンド: 3 つの選択肢

### 選択肢 A: Render (推奨 — DB 自動作成)

`render.yaml` (Blueprint) を使うと、バックエンドと PostgreSQL をワンクリックでデプロイできます。

#### Render 手順

1. [Render](https://render.com) にログインし、GitHub リポジトリを接続
2. 「New」→「Blueprint」を選択
3. リポジトリを選び、`render.yaml` が自動検出される
4. 環境変数を入力:
   - `ADMIN_EMAIL` — 管理者メールアドレス
   - `ADMIN_PASSWORD` — 管理者パスワード
   - (`SECRET_KEY` と `DATABASE_URL` は自動生成・自動接続)
5. 「Apply」をクリック

#### Render 構成内容

- Web サービス: `backend/Dockerfile.prod` でビルド
- PostgreSQL: `portfolio-db` (free プラン) を自動作成
- ディスク: `/code/uploads` に 1GB マウント (画像アップロード用)
- ヘルスチェック: `/api/health`
- リージョン: Singapore

---

### 選択肢 B: Fly.io

#### Fly.io 前提

- [flyctl CLI](https://fly.io/docs/flyctl/install/) がインストール済み
- `fly auth login` でログイン済み

#### Fly.io 手順

```bash
# 1. アプリ作成 (fly.toml の設定が使われる)
fly launch --config fly.toml --no-deploy

# 2. PostgreSQL アドオン作成
fly postgres create --name portfolio-db --region nrt

# 3. DB をアプリにアタッチ (DATABASE_URL が自動設定される)
fly postgres attach portfolio-db

# 4. アップロード用ボリューム作成
fly volumes create uploads_data --region nrt --size 1

# 5. シークレット設定
fly secrets set \
  SECRET_KEY="$(openssl rand -hex 32)" \
  ADMIN_EMAIL="admin@example.com" \
  ADMIN_PASSWORD="your-secure-password"

# 6. デプロイ
fly deploy
```

#### Fly.io 構成内容

- リージョン: `nrt` (東京)
- 自動スケール: リクエストがなければマシン停止、アクセス時に自動起動
- ヘルスチェック: `/api/health` (30秒間隔)
- ボリューム: `uploads_data` → `/code/uploads`

#### Fly.io 確認

```bash
# ステータス確認
fly status

# ログ確認
fly logs

# ヘルスチェック
curl https://portfolio-backend.fly.dev/api/health
```

---

### 選択肢 C: Railway

#### Railway 手順

1. [Railway](https://railway.com) にログインし、「New Project」
2. 「Deploy from GitHub repo」でリポジトリを接続
3. 「Add Database」→ PostgreSQL を追加
4. バックエンドサービスの設定:
   - `railway.json` が自動検出される
   - Variables タブで環境変数を設定:

     ```text
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     SECRET_KEY=<openssl rand -hex 32 の結果>
     ADMIN_EMAIL=admin@example.com
     ADMIN_PASSWORD=your-secure-password
     ```

5. 「Deploy」をクリック

#### Railway 構成内容

- ビルド: `backend/Dockerfile.prod`
- ヘルスチェック: `/api/health`
- 再起動ポリシー: 失敗時に最大 3 回リトライ

---

## デプロイ後の確認

### バックエンド API 確認

```bash
# ヘルスチェック
curl https://<backend-url>/api/health

# Swagger UI
open https://<backend-url>/docs

# 管理者ログイン
curl -X POST https://<backend-url>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

### フロントエンド確認

- `https://<vercel-url>` にアクセスし、公開ページが表示されることを確認
- `/login` から管理者ログインできることを確認
- `/admin` ダッシュボードでデータが表示されることを確認

### CORS 設定

バックエンドの CORS にフロントエンドのドメインを許可する必要がある場合は、`backend/app/main.py` の `allow_origins` にドメインを追加してください。

---

## 本番用 Dockerfile について

### backend/Dockerfile.prod

- マルチステージビルドで軽量イメージを生成
- 起動時に `alembic upgrade head` でマイグレーションを自動実行
- `uvicorn` で本番モード起動 (ポート 8000)

### frontend/Dockerfile.prod

- Next.js の `standalone` 出力でビルド
- 最終イメージには `.next/standalone` + `.next/static` + `public` のみ含む
- Docker ベースのプラットフォーム (Fly.io, Railway 等) でフロントエンドをホストする場合に使用

---

## トラブルシューティング

| 症状 | 原因・対処 |
| --- | --- |
| フロントエンドから API にアクセスできない | `NEXT_PUBLIC_API_URL` が正しいか確認。CORS 設定を確認 |
| DB 接続エラー | `DATABASE_URL` の形式を確認 (`postgresql://user:pass@host:5432/dbname`) |
| マイグレーションエラー | `fly ssh console` や Render Shell でログを確認 |
| 画像アップロードが保存されない | ボリューム/ディスクが正しくマウントされているか確認 |
| 管理者ログインできない | `ADMIN_EMAIL` / `ADMIN_PASSWORD` が正しく設定されているか確認 |
