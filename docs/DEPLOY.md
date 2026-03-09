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

## 現在のデプロイ先

| サービス | プラットフォーム | URL |
| --- | --- | --- |
| フロントエンド | Vercel | <https://portfolio-render-eight.vercel.app> |
| バックエンド | Fly.io | <https://portfolio-backend-little-morning-3672.fly.dev> |
| Swagger UI | Fly.io | <https://portfolio-backend-little-morning-3672.fly.dev/docs> |

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

### Vercel 初回セットアップ

1. [Vercel](https://vercel.com) にログインし、GitHub リポジトリを接続
2. インポート設定:
   - **Framework Preset**: Next.js (自動検出)
   - **Root Directory**: `frontend/`
   - Build / Install コマンドは `frontend/vercel.json` で自動設定される
3. 環境変数を設定:
   - `NEXT_PUBLIC_API_URL` = バックエンドの本番 URL
4. 「Deploy」をクリック

### Vercel CLI でのデプロイ

```bash
# プロジェクトルートから実行 (.vercel/ はルートに配置する)
vercel login
vercel link --project portfolio-render --yes
vercel env add NEXT_PUBLIC_API_URL production
vercel --prod --yes
```

> **注意**: `.vercel/` ディレクトリはプロジェクトルートに配置すること。
> `frontend/` 内に配置すると Root Directory 設定と二重になり、
> `frontend/frontend` を参照してエラーになる。

### Vercel 設定ファイル

- `frontend/vercel.json` — `installCommand: bun install`, `buildCommand: bun run build`
- `frontend/next.config.ts` — `output: "standalone"` / API リライト / 画像ホスト許可

### Vercel 注意事項

- `NEXT_PUBLIC_API_URL` はビルド時に埋め込まれるため、変更後は再デプロイが必要
- 画像最適化は Vercel が自動で処理する

---

## バックエンド: Fly.io (現在のデプロイ先)

### Fly.io 前提

- [flyctl CLI](https://fly.io/docs/flyctl/install/) がインストール済み
- `fly auth login` でログイン済み

### Fly.io 初回セットアップ

```bash
# 1. アプリ作成 (fly.toml の設定が使われる)
fly launch --config fly.toml --no-deploy --copy-config

# 2. PostgreSQL アドオン作成 (名前が取られている場合はサフィックスを追加)
fly postgres create --name portfolio-db-<suffix> --region nrt \
  --vm-size shared-cpu-1x --initial-cluster-size 1 --volume-size 1

# 3. DB をアプリにアタッチ (DATABASE_URL が自動設定される)
fly postgres attach portfolio-db-<suffix>

# 4. アップロード用ボリューム作成
fly volumes create uploads_data --region nrt --size 1 \
  --app <app-name> -y

# 5. シークレット設定 (パスワードにシェル特殊文字を含めないこと)
fly secrets set \
  SECRET_KEY="$(openssl rand -hex 32)" \
  ADMIN_EMAIL='admin@example.com' \
  ADMIN_PASSWORD='your-secure-password' \
  --app <app-name>

# 6. デプロイ
fly deploy --app <app-name>
```

### Fly.io 再デプロイ

```bash
fly deploy --app portfolio-backend-little-morning-3672
```

### Fly.io 運用コマンド

```bash
# ステータス確認
fly status --app portfolio-backend-little-morning-3672

# ログ確認
fly logs --app portfolio-backend-little-morning-3672

# ヘルスチェック
curl https://portfolio-backend-little-morning-3672.fly.dev/api/health

# SSH コンソール
fly ssh console --app portfolio-backend-little-morning-3672

# マシン再起動
fly machine restart <machine-id> --app portfolio-backend-little-morning-3672
```

### Fly.io 構成内容 (fly.toml)

- リージョン: `nrt` (東京)
- ビルド: プロジェクトルートをコンテキストとして `backend/Dockerfile.prod` を使用
- 自動スケール: リクエストがなければマシン停止、アクセス時に自動起動
- ヘルスチェック: `/api/health` (30秒間隔)
- ボリューム: `uploads_data` → `/code/uploads`

### Fly.io 注意点

- `fly postgres attach` で設定される `DATABASE_URL` は `postgres://` スキーマだが、
  SQLAlchemy は `postgresql://` を要求する。`database.py` と `alembic/env.py` で自動変換済み
- `ADMIN_PASSWORD` にシェル特殊文字 (`!`, `$` 等) を含めると展開される。
  シングルクォートで囲むか、英数字のみのパスワードを使用する
- 管理者ユーザーはアプリ起動時に一度だけシードされる。パスワード変更後は
  SSH で既存ユーザーを削除してからマシンを再起動する

---

## バックエンド代替: Render

### Render 手順

`render.yaml` (Blueprint) を使うと、バックエンドと PostgreSQL をワンクリックでデプロイできます。

1. [Render](https://render.com) にログインし、GitHub リポジトリを接続
2. 「New」→「Blueprint」を選択
3. リポジトリを選び、`render.yaml` が自動検出される
4. 環境変数を入力:
   - `ADMIN_EMAIL` — 管理者メールアドレス
   - `ADMIN_PASSWORD` — 管理者パスワード
   - (`SECRET_KEY` と `DATABASE_URL` は自動生成・自動接続)
5. 「Apply」をクリック

### Render 構成内容

- Web サービス: `backend/Dockerfile.prod` でビルド (starter プラン)
- PostgreSQL: `portfolio-db` (free プラン) を自動作成
- ディスク: `/code/uploads` に 1GB マウント (starter 以上のプランが必要)
- ヘルスチェック: `/api/health`
- リージョン: Singapore

---

## バックエンド代替: Railway

### Railway 手順

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

### Railway 構成内容

- ビルド: `backend/Dockerfile.prod`
- ヘルスチェック: `/api/health`
- 再起動ポリシー: 失敗時に最大 3 回リトライ

---

## デプロイ後の確認

### バックエンド API 確認

```bash
# ヘルスチェック
curl https://portfolio-backend-little-morning-3672.fly.dev/api/health

# 管理者ログイン
curl -X POST https://portfolio-backend-little-morning-3672.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

### フロントエンド確認

- <https://portfolio-render-eight.vercel.app> にアクセスし、公開ページが表示されることを確認
- `/login` から管理者ログインできることを確認
- `/admin` ダッシュボードでデータが表示されることを確認

### CORS 設定

フロントエンドのドメインを変更した場合は、`backend/app/main.py` の `allow_origins` にドメインを追加して再デプロイすること。

---

## 本番用 Dockerfile

### backend/Dockerfile.prod

- マルチステージビルドで軽量イメージを生成 (約 80MB)
- ビルドコンテキストはプロジェクトルート (`backend/` プレフィックス付きで COPY)
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
| フロントエンドから API にアクセスできない | `NEXT_PUBLIC_API_URL` が正しいか確認。`backend/app/main.py` の CORS 設定を確認 |
| `Can't load plugin: sqlalchemy.dialects:postgres` | `DATABASE_URL` が `postgres://` で始まっている。`database.py` の変換処理を確認 |
| DB 接続エラー | `DATABASE_URL` の形式を確認 (`postgresql://user:pass@host:5432/dbname`) |
| マイグレーションエラー | `fly ssh console` や Render Shell でログを確認 |
| 画像アップロードが保存されない | ボリューム/ディスクが正しくマウントされているか確認 |
| 管理者ログインできない | `ADMIN_EMAIL` / `ADMIN_PASSWORD` が正しく設定されているか確認。パスワード変更時は既存ユーザー削除後にマシン再起動 |
| Vercel で `frontend/frontend` エラー | `.vercel/` がプロジェクトルートにあるか確認。`frontend/` 内にあると二重パスになる |
