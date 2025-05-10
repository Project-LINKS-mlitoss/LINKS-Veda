# 環境準備の要求：
- Terraform v1.9.5

# ソースコードクローン：
- `git clone https://github.com/eukarya-inc/LINKS-Veda.git`を実行してください。

# セットアップ：
- クローンしたフォルダ内で、以下のコマンドを実行してください
```bash
cd processing // プロジェクトフォルダにアクセス
gcloud auth login —update-adc 
```

- サービス アカウントを作成し役割を付与する。(Editor 及び Secret Manager Secret Accessor)

- state管理バケットの作成：
    + Google コンソールでCloud Storageにアクセスしstate管理バケットを作成する。

    + backend.confファイルを開き、作成されたバケット名でバケットの値を更新する。

- サービスを有効にすること：
    + Google コンソールにアクセスしService Usage APIを有効にする。

- variables.tfvarsファイルにアクセスし環境情報を記入する。

# 初期化及びデプロイ：
## Init Terraform
```bash
export GOOGLE_APPLICATION_CREDENTIALS="./credentials.json"
terraform init -backend-config=backend.conf
```

## 環境を分けること：
- 例えば、開発環境です。（他の環境である場合開発環境を希望環境に変更する）。
- 環境を分けない場合開発環境をdefaultに変更する。
```bash
terraform workspace select dev || terraform workspace new dev
```

## 各変更の確認：
```bash
terraform plan -var-file="variables.tfvars"
```

## デプロイ
```bash
terraform apply -var-file="variables.tfvars" -parallelism=30 -auto-approve
```

## Destroy
```bash
terraform destroy -var-file="variables.tfvars" -auto-approve
```

## デプロイ後のGateway Urlを見る。
 ```bash
terraform output
```


## Unlock
 ```bash
terraform force-unlock <ID Lock>
```