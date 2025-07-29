# ビンゴゲーム Web アプリ

Node.js + Express.js を使用したビンゴゲームの抽選アプリケーションです。

## 機能

- 数字の範囲を指定してビンゴゲームを開始（例：39と入力すると1-39の範囲）
- 「Next」ボタンで抽選を実行し数字を表示
- 抽選済み数字の一覧表示
- ゲームのリセット機能
- レスポンシブデザイン対応

## 技術スタック

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + CSS3 + JavaScript (ES6+)
- **Container**: Docker対応
- **Storage**: メモリベース（データベース不要）

## 開発・実行

### ローカル環境での実行

```bash
# 依存関係のインストール
npm install

# アプリケーションの起動
npm start
```

アプリケーションは http://localhost:3000 でアクセスできます。

### Docker を使用した実行

```bash
# Dockerイメージのビルド
docker build -t bingo-webapp .

# コンテナの実行
docker run -p 3000:3000 bingo-webapp
```

## API エンドポイント

- `GET /` - フロントエンドページ
- `POST /api/start-game` - ゲーム開始
- `POST /api/draw-number` - 数字抽選
- `GET /api/game-state` - ゲーム状態取得
- `POST /api/reset-game` - ゲームリセット

## 使い方

1. 数字の範囲を入力（例：39）
2. 「ゲーム開始」ボタンをクリック
3. 「Next」ボタンで数字を抽選
4. 抽選済み数字が画面下部に表示される
5. 「リセット」ボタンでゲームをリセット

## CI/CD

このプロジェクトは GitHub Actions を使用してAzureインフラへの自動デプロイを行います。

- **デプロイ先**: Azure Container Apps
- **コンテナレジストリ**: Azure Container Registry
- **認証方式**: OpenID Connect（OIDC）
- **トリガー**: `main` ブランチへのプッシュまたはプルリクエスト

### セットアップ

Azure デプロイのセットアップについては [Azure CI/CD セットアップガイド](docs/AZURE_SETUP.md) を参照してください。

#### 必要なGitHub Secrets

- `AZURE_REGISTRY_LOGIN_SERVER` - Azure Container Registry のログインサーバー
- `AZURE_REGISTRY_USERNAME` - Azure Container Registry のユーザー名
- `AZURE_REGISTRY_PASSWORD` - Azure Container Registry のパスワード
- `AZURE_CONTAINER_APP_NAME` - Azure Container Apps の名前
- `AZURE_RESOURCE_GROUP` - Azure リソースグループ名
- `AZURE_CLIENT_ID` - Azure アプリケーションのクライアントID
- `AZURE_TENANT_ID` - Azure テナントID
- `AZURE_SUBSCRIPTION_ID` - Azure サブスクリプションID

## ライセンス

ISC