# 11-12. iot-02

## 目的

- Telemetry データを AWS IoT Core へ送信し、`IoT Rule -> Firehose -> S3` 経路で保存できることを検証する
- Telemetry データを受信し、Web でリアルタイムグラフ表示できることを検証する

## 責務境界

- `11-11.iot-01`: subscribe / unsubscribe、受信表示、DynamoDB 保存確認を扱う
- `11-12.iot-02`: Telemetry 送受信、リアルタイム可視化、IoT Rule / Firehose / S3 保存確認を扱う
- `11-12.iot-02` は S3 保存経路確認を主目的とし、DynamoDB 保存確認は扱わない

## 実装対象（配置）

- `packages/web`
  - `11-12.iot-02` の route / page / components / hooks を配置する
  - 送信 Worker・受信 Worker は 11-12 ドメイン配下へ閉じて配置する
- `packages/mqtt-schema`
  - topic / payload の共有契約を定義する
  - Web / Functions / Infra は同じ契約を参照する
- `packages/functions`
  - S3 保存確認の query（または同等の確認 API）を配置する
- `packages/infra`
  - `2-9.realtime-stack` の責務として IoT Rule / Firehose / S3 を管理する

## データモデル（サンプル）

- 型名は `Telemetry` 系で統一する
  - `TelemetryMessage`: 1回送信するメッセージ全体
  - `TelemetryPoint`: 1点の計測値
  - `TelemetrySample`: 表示向けに扱うデータ
- `TelemetryMessage` の基本項目
  - `timestamp`
  - `patientId`
  - `roomId`
  - `event`
  - `samplingHz`
  - `points`（`TelemetryPoint[]`）

## 送信頻度（ドメイン例）

- 本章の数値は心電図サンプルのドメイン例として扱う
  - `1秒あたり128点`
  - `1秒に4メッセージ送信`
  - `1メッセージあたり32点`
- 実際の型・頻度は差し替え可能とし、固定実装にしない

## 詳細設計

- `送信側（Web Worker）`
  - Worker がサンプル Telemetry データを生成し、定期送信する
  - 画面は送信開始 / 停止を操作できる
  - 画面は送信状態（停止中 / 送信中 / エラー）を表示する
- `受信側（Web Worker）`
  - Worker が MQTT 受信を担当する
  - 画面は受信状態（未接続 / 接続中 / 受信中 / エラー）を表示する
  - 受信データをリアルタイムグラフで表示する
- `IoT Rule`
  - 対象 topic のメッセージを検知し Firehose へ渡す
  - MQTT で送信された payload は変換せずに受け渡す
- `Firehose`
  - 受け取った payload を S3 に配信する（本線）
  - S3 には MQTT 送信データがそのまま保存される（IoT Rule 経由）
- `S3 保存確認`
  - 画面から保存確認を実行し、保存時刻 / S3 key / 主要項目を表示する
  - S3 反映に時間差があることを画面上で明示する

## topic 方針

- `11-12` 用 topic を `11-11` と分離する
- topic は `.../telemetry` 系で分離する
- topic には `sharedEnv / stage / institution / room` を含める
- 環境混線を防ぎ、保存結果の追跡を容易にする
- topic 形式の正本は `packages/mqtt-schema/topic.ts` とし、独自実装を追加しない
  - `buildIotEventTopic`
  - `buildIotEventTopicRuleSql`

## インターフェース方針

- `送信 I/F`
  - 送信 Worker への入力は `roomId / patientId / samplingHz / pointsPerMessage / messagesPerSecond` を基本とする
  - 送信開始後は Worker 側で `TelemetryMessage` を生成し、UI スレッドは publish 制御のみを持つ
- `受信 I/F`
  - 受信 Worker から UI へは `receivedAt / topic / payload` を渡す
  - UI 側は受信データをグラフ表示用 `TelemetrySample` に変換して表示する
- `保存確認 I/F`
  - 保存確認入力は `roomId` / `patientId` を必須とする
  - 保存確認レスポンスは少なくとも `savedAt / s3Key / roomId / patientId / event` を返す

## サンプル型（iot-02）

- iot-02 のサンプルは心電図データを扱う
  - `event`: `telemetry.ecg.v1`
  - `timestamp`: セッション開始時刻（固定値）
  - `data.seq`: メッセージ番号（0始まり）
  - `data.ecg`: 1メッセージあたり 32 点
- `1 seq = 32 点` を前提にする
  - 1秒あたり 128 点（= 1秒に4メッセージ × 32点）
  - 各点の時刻は `timestamp + ((seq * 32 + pointIndex) * 1000 / 128)ms` で算出する

## エラー時の扱い

- `roomId` / `patientId` 未入力時は送信開始しない
- 接続失敗時はエラー表示し、再試行できる
- 保存結果が空の場合は「未保存」または「反映待ち」を表示する

## 着手条件

- `11-11.iot-01` で基本接続経路が成立していること
- 対象 topic に publish 可能であること
- S3 保存結果を取得する API 経路が利用可能であること
- インフラ作成・更新は `2-9.realtime-stack` を参照して同時に進めること
  - `docs/overview/2.infra-resources/2-9.realtime-stack/overview.md`

## スコープ外

- Athena 連携の最適化
- 変換処理の高度化
- DynamoDB を使った受信データ保存確認

## 完了条件

- 送信 Worker で定期送信できる
- 受信 Worker でメッセージ受信できる
- リアルタイムグラフが更新される
- IoT Rule / Firehose を経由して S3 保存される
- 画面で保存結果を確認できる
- 入力不足 / 接続失敗時の表示ができる

## 実装前チェック

- 画面導線
  - `11.feature-use-cases` の一覧とサイドナビに `11-12.iot-02` 導線を追加する
- 共有契約
  - topic / payload 仕様を `packages/mqtt-schema` へ先に定義し、Web / Functions / Infra の順で参照する
- 検証経路
  - 実装後の確認順は `subscribe -> sender start -> realtime graph -> S3 保存確認` で統一する

## 決定ログ

- 2026-04-28: 章テンプレートを統一し、未着手スコープを明文化
- 2026-05-06: `11-12.iot-02` は IoT Rule / Firehose / S3 保存を対象とし、Lambda は必要に応じた確認用の副系統として扱う方針を追加
- 2026-05-23: Telemetry を送受信する詳細設計（Web Worker 分離、リアルタイムグラフ表示、128Hz ドメイン例）を追加
