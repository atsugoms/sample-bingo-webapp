# Azure CI/CD セットアップガイド

このドキュメントでは、Azure Container Apps と Azure Container Registry への自動デプロイを設定する方法を説明します。

## 必要な GitHub Secrets

以下のシークレットをGitHubリポジトリの Settings > Secrets and variables > Actions で設定してください：

### Azure Container Registry 設定

- **AZURE_REGISTRY_LOGIN_SERVER**: Azure Container Registry のログインサーバー
  - 例: `myregistry.azurecr.io`

- **AZURE_REGISTRY_USERNAME**: Azure Container Registry のユーザー名
  - 管理者ユーザーまたはサービスプリンシパルのユーザー名

- **AZURE_REGISTRY_PASSWORD**: Azure Container Registry のパスワード
  - 管理者パスワードまたはサービスプリンシパルのパスワード

### Azure Container Apps 設定

- **AZURE_CONTAINER_APP_NAME**: Azure Container Apps の名前
  - 例: `bingo-webapp-app`

- **AZURE_RESOURCE_GROUP**: Azure リソースグループ名
  - 例: `rg-bingo-webapp`

### Azure OpenID Connect 認証設定

- **AZURE_CLIENT_ID**: Azure アプリケーション（サービスプリンシパル）のクライアントID
- **AZURE_TENANT_ID**: Azure Active Directory テナントID
- **AZURE_SUBSCRIPTION_ID**: Azure サブスクリプションID

## Azure アプリケーション登録とOpenID Connect設定

### 1. Azure アプリケーション登録の作成

Azure CLIを使用してアプリケーション登録を作成：

```bash
az ad app create --display-name "github-actions-oidc"
```

### 2. サービスプリンシパルの作成

```bash
az ad sp create --id <application-id-from-step-1>
```

### 3. GitHub ActionsのためのFederated Credentialの設定

```bash
az ad app federated-credential create --id <application-id> --parameters '{
    "name": "github-actions",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:<your-github-username>/<your-repo-name>:ref:refs/heads/main",
    "description": "GitHub Actions for main branch",
    "audiences": ["api://AzureADTokenExchange"]
}'
```

### 4. 必要な権限の付与

サービスプリンシパルにリソースグループへの貢献者権限を付与：

```bash
az role assignment create \
  --assignee <service-principal-id> \
  --role contributor \
  --scope /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>
```

## デプロイフロー

1. **トリガー**: `main` ブランチへのプッシュまたはプルリクエスト
2. **ビルド**: Dockerイメージをビルド
3. **プッシュ**: Azure Container Registry にイメージをプッシュ
4. **認証**: OpenID Connectを使用してAzureに認証
5. **デプロイ**: Azure Container Apps にデプロイ

## OpenID Connectの利点

- **シークレット不要**: クライアントシークレットの管理が不要
- **セキュリティ向上**: 短期間有効なトークンを使用
- **自動ローテーション**: 手動でのシークレット更新が不要

## トラブルシューティング

### よくある問題

1. **認証エラー**: 
   - Azure Client ID、Tenant ID、Subscription IDが正しく設定されているか確認
   - Federated Credentialが正しく設定されているか確認
2. **権限エラー**: サービスプリンシパルに適切な権限が付与されているか確認
3. **リソース名エラー**: Azure リソース名が正しく設定されているか確認
4. **OIDC設定エラー**: GitHub リポジトリのsubjectが正しく設定されているか確認

### ログの確認

GitHub Actions の実行ログで詳細なエラー情報を確認できます。

### Federated Credentialの確認

```bash
az ad app federated-credential list --id <application-id>
```