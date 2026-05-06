# 2-8. domain

## 対象

- ドメイン取得元と DNS 管理境界
- SES/Cognito のメール送信に必要なドメイン前提
- CloudFront 配信URL（Webカスタムドメイン）の前提

## 仕様

- `ドメイン基準`: 全公開系の名前解決基準を `proto-foundation.com` に統一する
  - 取得済みの基本ドメインは `proto-foundation.com` とする
  - Web 公開URLとメール送信元は同一ドメイン配下で運用する
- `責務境界`: 取得管理と IaC 管理の境界を分離する
  - ドメイン取得/更新（レジストラ契約）は IaC 管理対象外とする
  - Hosted Zone / DNS レコード / 証明書接続は IaC 管理対象とする
  - stage 固有 FQDN（`web.<stage>...` / `api.<stage>...`）の証明書と接続は AppStack 側責務とする
  - 理由: App 内で公開エンドポイント（サブドメイン）を追加したときに、SharedStack の更新を不要にして変更境界を App に閉じるため
  - SharedStack は stage/エンドポイント非依存の共通基盤値のみを管理する
  - Hosted Zone 参照は `HOSTED_ZONE_ID` / `HOSTED_ZONE_NAME` の確定値入力を利用し、synth 時解決不能な token 参照を避ける
- `DNS管理`: 公開経路に必要なレコードを Route53 で管理する
  - CloudFront 用 Alias レコード（Web カスタムドメイン）を管理する
  - SES 検証用レコード（DKIM/MX/TXT）を管理する
- `Web公開ドメイン`: CloudFront のカスタムドメインを利用する
  - Web URL は `proto-foundation.com` 配下サブドメインを利用する
  - Web カスタムドメインの証明書は ACM `us-east-1` を利用する
- `API公開ドメイン`: API Gateway のカスタムドメインを利用する
  - API URL は `proto-foundation.com` 配下サブドメインを利用する
  - API カスタムドメインの証明書は API と同一リージョン（`ap-northeast-1`）を利用する
- `メール送信ドメイン`: SES/Cognito 連携の送信元を固定する
  - SES identity domain は `${sharedEnv}.${HOSTED_ZONE_NAME}` を利用する
  - 送信元アドレスは `no-reply@${sharedEnv}.${HOSTED_ZONE_NAME}` の規則で固定する
  - SES identity は SharedStack 管理値を AuthStack が参照する
- `ステージ分離`: 環境ごとに Web/API ドメインを分離する
  - Web は `web.<stage>.proto-foundation.com` を利用する
  - API は `api.<stage>.proto-foundation.com` を利用する

## 連携先

- SharedStack: `2-1.shared-stack`（SES identity / 共有パラメータ）
- AuthStack: `2-7.auth-stack`（Cognito `emailConfiguration`）
- WebStack: `2-6.web-stack`（CloudFront カスタムドメイン）
- ApiStack: `2-3.api-stack`（API Gateway カスタムドメイン）

## 決定ログ

- 2026-05-03: ドメイン章（2-8）を新設し、`proto-foundation.com` 前提の管理境界を明文化
- 2026-05-03: Domain章の対象を SES だけでなく CloudFront カスタムドメイン（Web URL）まで拡張
- 2026-05-03: App 内の公開エンドポイント追加時に Shared 更新を不要にするため、stage 固有 FQDN の証明書/接続は AppStack 管理とする方針を追加
