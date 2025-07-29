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

- **AZURE_CREDENTIALS**: Azure サービスプリンシパルの認証情報（JSON形式）
  ```json
  {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "subscriptionId": "your-subscription-id",
    "tenantId": "your-tenant-id"
  }
  ```

## Azure サービスプリンシパルの作成

Azure CLIを使用してサービスプリンシパルを作成：

```bash
az ad sp create-for-rbac --name "github-actions-sp" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group-name} \
  --sdk-auth
```

出力されたJSONを `AZURE_CREDENTIALS` シークレットに設定してください。

## デプロイフロー

1. **トリガー**: `main` ブランチへのプッシュまたはプルリクエスト
2. **ビルド**: Dockerイメージをビルド
3. **プッシュ**: Azure Container Registry にイメージをプッシュ
4. **デプロイ**: Azure Container Apps にデプロイ

## トラブルシューティング

### よくある問題

1. **認証エラー**: Azure認証情報が正しく設定されているか確認
2. **権限エラー**: サービスプリンシパルに適切な権限が付与されているか確認
3. **リソース名エラー**: Azure リソース名が正しく設定されているか確認

### ログの確認

GitHub Actions の実行ログで詳細なエラー情報を確認できます。