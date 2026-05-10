# 11-12. iot-02

## 検証対象

- AWS IoT Rule + Kinesis Data Firehose + S3 保存検証

## 目的

- AWS IoT Core に送信されたリアルタイムデータを IoT Rule で拾い、Firehose 経由で S3 に蓄積できることを検証する
- 蓄積対象 topic に送信したデータが、途中の確認用 Lambda と最終保存先 S3 の両方で追跡できることを検証する

## 検証スコープ

- `MQTT接続`: 認証済み Web ユーザーが AWS IoT Core の MQTT over WebSocket に接続できる
  - Web は接続状態（未接続 / 接続中 / 接続済み / 切断）を表示する
  - 接続できない場合は Firehose 対象 topic へ publish できないため、S3 蓄積確認へ進まない
- `publish`: Web 画面に Firehose 対象 topic へ検証 payload を送信するボタンを配置する
  - publish ボタン押下で IoT Rule の対象 topic に JSON payload を送信する
  - payload には送信時刻、送信者、検証用メッセージ本文を含める
- `IoT Rule`: 対象 topic のメッセージを IoT Rule が検知する
  - IoT Rule は Firehose へ payload を渡す本線として扱う
  - IoT Rule の SQL は topic から必要な識別子を補完できる形にする
- `Firehose`: IoT Rule から受け取った payload を S3 へ配信する
  - Firehose は S3 保存用の本線とする
  - バッファリングにより S3 反映まで遅延があることを画面説明または表示状態で分かるようにする
- `S3保存確認`: Web から S3 保存結果を確認できる
  - Web は保存結果取得ボタンを持つ
  - 取得結果は保存時刻、S3 key、payload の主要フィールドを表示する
- `確認用Lambda`: 必要に応じて IoT Rule から Lambda も発火させ、Firehose とは別の確認ログを残す
  - Lambda は蓄積本線ではなく、検証時に途中到達を確認する副系統として扱う
  - Lambda の結果は CloudWatch Logs または検証用保存先で確認する

## 責務境界

- `11-11.iot-01`: MQTT の接続・購読・送信・Web受信・Lambda発火・DynamoDB保存を扱う
- `11-12.iot-02`: MQTT 接続確認、IoT Rule / Firehose / S3 保存を扱う
- `11-12.iot-02` では Web のリアルタイム受信表示を主目的にしない

## スコープ外

- Athena 連携の最適化
- 変換処理の高度化
- MQTT subscribe / unsubscribe の基本確認
- DynamoDB を使った受信データ保存確認

## 着手条件

- `11-11.iot-01` で受信経路が成立していること
- IoT Rule 対象 topic に検証 payload を publish できること
- S3 保存結果を確認するための GraphQL または API 経路が利用可能であること

## 決定ログ

- 2026-04-28: 章テンプレートを統一し、未着手スコープを明文化
- 2026-05-06: `11-12.iot-02` は IoT Rule / Firehose / S3 保存を対象とし、Lambda は必要に応じた確認用の副系統として扱う方針を追加
