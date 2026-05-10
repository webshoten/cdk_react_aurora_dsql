# 11-11. iot-01

## 検証対象

- AWS IoT Core の MQTT subscribe / GraphQL publish / Lambda 連携 / DynamoDB 保存確認

## 目的

- 同一画面で `subscribe -> mutation publish -> Web受信 -> DynamoDB確認` を追えることを検証する
- Task 10 は新しい基盤機能の追加ではなく、既存の publish / subscribe / 保存確認経路を 1 画面で連続確認できる導線統合を目的とする

## 検証スコープ

- `MQTT接続`: 認証済み Web ユーザーが MQTT over WebSocket に接続できる
- `subscribe / unsubscribe`: `roomId` を指定して購読開始・解除を実行できる
- `publish`: Web からは GraphQL mutation を呼び、backend が IoT Data Plane で publish する
- `Web受信表示`: subscribe 中に受信したメッセージを一覧表示できる
- `DynamoDB保存確認`: `iotStatesByRoom(roomId)` で保存済み state を確認できる

## 命名制約（IoT TopicRule）

- `AWS::IoT::TopicRule` の `ruleName` は `^[a-zA-Z0-9_]+$` を満たす必要がある
  - 利用可能文字は英字・数字・`_` のみ
  - `-`（ハイフン）は利用しない

## 画面構成（11-11 Web 検証ページ）

- `上段（共通操作）`: room 単位の購読操作を行う
  - `roomId` 入力欄
  - `Subscribe` / `Unsubscribe` ボタン
  - 接続状態（未接続 / 接続中 / 接続済み / 切断 / エラー）表示
  - `roomId` 未入力時は subscribe を実行しない
- `中段（2カラム）`: 送信と受信を分離表示する
  - `送信`: `publishOnStartRoom` 実行ボタンと結果表示
  - `受信`: MQTT 受信一覧（`topic`, `receivedAt`, `payload`）
  - Web から MQTT へ直接 publish は行わない
- `下段（保存確認）`: DynamoDB 保存結果を表示する
  - `iotStatesByRoom(roomId)` の一覧表示
  - `roomId` 未入力時は query を実行しない

## Task 10 の確認導線

- 11-11 ページは次の順で動作確認できる構成にする
  - `Subscribe`: 対象 room topic の購読開始
  - `Mutation Publish`: GraphQL mutation で backend publish 実行
  - `Web 受信確認`: subscribe 中の受信一覧へ反映されることを確認
  - `Lambda 発火確認`: publish 後に subscriber Lambda が処理した前提をログで確認
  - `DynamoDB Query 確認`: 同じ roomId で保存結果（state upsert）を取得して表示

## スコープ外

- 双方向制御の高度化
- 大規模同時接続の最適化
- Firehose / S3 蓄積経路（11-12で扱う）

## 着手条件

- IoT Data endpoint / 認証情報の受け渡し経路が利用可能であること
- 認証済み Web ユーザーで検証ページへアクセスできること

## 決定ログ

- 2026-04-28: 章テンプレートを統一
- 2026-05-09: 11-11 の画面構成を「上段共通操作 / 中段送受信 / 下段DynamoDB確認」に固定
