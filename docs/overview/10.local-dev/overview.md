# 10. ローカル開発

## 対象

- ローカルでのデバッグ手順
- DB データ参照・確認手順

## 現状

- migration は `pnpm migrate` で `zip -> S3 upload -> Lambda invoke` 方式で実行する
- 実行結果の最終確認は CloudWatch Logs（`migration.invoke.success/failed`）で行う
- `pnpm migrate` は invoke 成功（`StatusCode=200`）だけで成功扱いせず、payload の `ok` を判定して `ok:false` は失敗として扱う
- `pnpm migrate` 失敗時は payload の `error.message` / `error.cause.message` / 失敗 migration id を標準出力へ表示する
- ローカルデバッグは `web(Vite)` と `functions(Yoga)` を直接起動し、API Gateway/Lambda 経路をバイパスする
- ローカル `functions(Yoga)` は疑似 authorizer で `Authorization: Bearer <idToken>` を検証し、GraphQL `context.auth` を構成する
- 疑似 authorizer の入力は `APIGatewayRequestAuthorizerEventV2` 互換の構造で組み立て、認証処理は backend 本体の `authorizeRequest` を再利用する
- ローカルの認証失敗時は `context.auth = null` とし、resolver 側で `unauthorized` を返す挙動に統一する（ローカル専用 bypass は持たない）
- IoT のローカルデバッグ手段（Greengrass / SAM / 独自 Mock）は未定とする
- 現在の IoT Custom Authorizer は AWS IoT Core 経由で AWS 上の Lambda として実行されるため、ローカル step debug の対象外とする
- IoT Custom Authorizer のデバッグは CloudWatch Logs を一次確認手段とする
- IoT Core 固有機能の最終確認は AWS 実経路（IoT Core + CloudWatch logs）で実施する
- DB は Aurora DSQL 実環境を参照し、接続設定はローカル `.env.local` で管理する
- CDK 変更時は deploy/destroy 実行中確認を必須ルールとして運用する

## 構成

- `10-2.debug`: ローカル検証・デバッグ導線
- `10-3.db`: DB データ参照・確認

## 運用方針

- セットアップ手順は `README.md` を正本とし、本章では重複記載しない
- 実行手順は「再現できる最小コマンド列」で記述する
- 失敗時は先に事実（エラーメッセージ/ログ）を収集してから対処する
- 既存の運用ルール（`8.coding-rules`）と矛盾しないことを優先する

## 決定ログ

- 2026-04-26: `10.local-dev` 章を追加
- 2026-04-26: local 開発情報を `setup/debug/db/runbook` に分離する方針を採用
- 2026-04-26: `setup` は `README.md` と重複するため章から削除し、`debug/db` に集約
- 2026-05-10: ローカル GraphQL は疑似 authorizer で `idToken` 検証し、`context.auth` を構成する方針を追加
- 2026-05-10: IoT ローカルデバッグ手段は未定とし、現状は AWS IoT Core 経由の AWS Lambda 実行を前提に CloudWatch Logs でデバッグする方針へ更新
