# 11-11. iot-01 実装タスク

## 目的

- 11-11.iot-01 の実装作業を、後から振り返れる粒度で管理する。
- 確定仕様は `overview.md` に置き、本ファイルは実装順序・変更対象・完了条件を管理する。

## 前提

- topic は `pf/<sharedEnv>/<stage>/medicalInstitution/<institutionId>/room/<roomId>/event` とする。
- `medicalInstitutionId` は数値文字列のみを有効値とする。
- IoT Data endpoint は `SharedStack` の `SharedIotEndpointConstruct` で取得して `/pf/shared/<sharedEnv>/iot/data-endpoint` に格納し、`RealtimeStack` / `ApiStack` 等の app stack は SSM 経由で参照する。理由: IoT Data endpoint はアカウント+リージョンで一意・固定であり、app stack 側で取得すると重複と `iot:DescribeEndpoint` クォータ消費を招くため、shared 層で 1 回だけ取得して再利用する。
- Web は MQTT subscribe を行う。
- Web から MQTT publish は行わず、GraphQL mutation 経由で backend が IoT Core へ publish する。
- 共有 schema package は役割が分かるように `-schema` suffix を付ける。
- GraphQL の共有 schema package は `packages/graphql-schema` とする。
- MQTT topic / payload の共有 schema package は `packages/mqtt-schema` とする。
- Lambda subscriber は `IoT TopicRule -> Lambda action` で起動する。
- DynamoDB 保存は ElectroDB を使い、room / patient state を upsert する。
- DynamoDB 保存結果は GraphQL query で取得する。

## 実装順

1. `MQTT schema package`
   - 最初に topic / payload の共有形式を固定し、Web / backend / CDK の実装ぶれを防ぐ。
   - この段階では AWS リソースや Web UI には接続しない。
2. `user:create の所属 ID 前提`
   - IoT 認可と topic 範囲制御の前提になる `medicalInstitutionId` をユーザー作成時に揃える。
   - 既に対応済みの場合は、確認だけで次へ進む。
3. `IoT Custom Authorizer`
   - `RealtimeStack` で Cognito ID token から `custom:institution_id` を検証し、subscribe 範囲を制限する。
   - Web MQTT 接続の前に認可境界を固定する。
4. `GraphQL mutation publish`
   - Web から直接 MQTT publish せず、backend が IoT Data Plane で publish する入口を作る。
   - payload は `packages/mqtt-schema` の schema に合わせる。
5. `IoT TopicRule -> Lambda`
   - backend publish された event topic を Lambda subscriber へ接続する。
   - この段階で publish -> Lambda 発火までを確認する。
6. `Lambda subscriber`
   - TopicRule payload と topic segment の整合を確認し、保存前の入力検証を入れる。
   - まずは CloudWatch Logs で受信内容と検証結果を確認する。
7. `DynamoDB ElectroDB Entity`
   - Lambda subscriber から room / patient state を upsert できる保存先を作る。
   - 保存設計は時系列ログではなく state upsert に固定する。
8. `GraphQL query 保存結果取得`
   - DynamoDB 保存結果を Web から確認する query を作る。
   - `roomId` 未指定時に query を実行しない前提を維持する。
9. `Web MQTT subscribe`
   - 認証済み Web から MQTT subscribe / unsubscribe と受信表示を作る。
   - Web から MQTT publish は実装しない。
10. `11-11 Web 検証ページ`
    - subscribe -> mutation publish -> Web 受信 -> Lambda 発火 -> DynamoDB query の確認導線を 1 画面にまとめる。
11. `権限整理`
    - Web は subscribe のみ、backend は publish、TopicRule は Lambda invoke のみに絞る。
12. `検証`
    - typecheck / build / CDK synth or diff / 実環境確認を行い、必要な docs を更新する。

## 進捗

- `Task 1: MQTT schema package` は実装済み（`packages/mqtt-schema` を追加）。
- `Task 4: GraphQL mutation publish` は実装済み（`publishOnStartRoom` を backend publish 経路として追加）。
- `Task 5: IoT TopicRule -> Lambda` は実装済み（`RealtimeStack` に event topic の TopicRule と subscriber Lambda 起動経路を追加）。
- `Task 6: Lambda subscriber` は実装済み（topic segment と payload の整合検証を追加し、検証結果を CloudWatch Logs へ出力）。
- `Task 7: DynamoDB ElectroDB Entity` は実装済み（`IotStateEntity` と upsert repository を追加し、subscriber から room / patient state を保存できる状態にした）。
- `Task 8: GraphQL query 保存結果取得` は実装済み（`iotStatesByRoom(roomId)` query を追加し、DynamoDB 保存結果の取得経路を GraphQL に統一）。

## タスク

1. `MQTT schema package`
   - 変更対象: `packages/mqtt-schema`。
   - 実装内容: `sharedEnv`, `stage`, `medicalInstitutionId`, `roomId` から event topic を組み立てる helper と、room / patient event payload schema を定義する。
   - 確認項目: `pf/dev/user/medicalInstitution/0001/room/room-001/event` を生成でき、Web bundle に Node.js / AWS SDK 依存が混入しない。
   - 完了条件: Web / backend / CDK が `packages/mqtt-schema` の同じ topic 形式と payload schema を参照できる。

2. `user:create の所属 ID 前提`
   - 変更対象: `scripts/create-user.ts`, `users` repository, 関連 docs。
   - 実装内容: `--medical-institution-id` を数値文字列として検証し、Cognito `custom:institution_id` と `users.medical_institution_id` に保存する。
   - 確認項目: `0001` は通り、英字や記号を含む値は拒否される。
   - 完了条件: IoT 検証用ユーザーを所属 ID 付きで作成できる。

3. `IoT Custom Authorizer`
   - 変更対象: `packages/infra/lib/stacks/app/realtime-stack.ts`, `packages/infra/lib/constructs/app/realtime/*`, IoT custom authorizer Lambda, `packages/infra/lib/stacks/shared/shared-stack.ts`, `packages/infra/lib/constructs/shared/iot-endpoint/*`。
   - 実装内容: Cognito ID token を検証し、`custom:institution_id` から subscribe 許可 topic を組み立てる。IoT Data endpoint は `SharedStack` の `SharedIotEndpointConstruct` で取得して SSM に格納し、`RealtimeStack` / `ApiStack` 等から SSM 参照に切り替える。理由: IoT Data endpoint はアカウント+リージョンで一意・固定であり、app stack 単位で取得する必要がない。
   - 確認項目: Web MQTT 接続では `pf/<sharedEnv>/<stage>/medicalInstitution/<institutionId>/room/*/event` の subscribe のみ許可する。`RealtimeStack` から `iot:DescribeEndpoint` カスタムリソースが消え、SSM `/pf/shared/<sharedEnv>/iot/data-endpoint` 経由で endpoint が解決される。
   - 完了条件: 別 medicalInstitutionId の topic を subscribe できない。app stack 側に IoT endpoint 取得用のカスタムリソースが残っていない。

4. `GraphQL mutation publish`
   - 変更対象: `packages/functions/src/graphql` の schema/resolver, backend IoT publish service, `packages/graphql-schema` の生成物。
   - 実装内容: Web から mutation を呼び、backend が IoT Data Plane で event topic へ publish する。
   - 確認項目: mutation は `roomId` と room state payload を受け、認証 context の所属 ID で topic を決める。
   - 完了条件: mutation 実行で event topic へ `onStartRoom` payload が publish される。

5. `IoT TopicRule -> Lambda`
   - 変更対象: CDK IoT TopicRule, Lambda subscriber, Lambda permission。
   - 実装内容: `AWS::IoT::TopicRule` の Lambda action で event subscriber Lambda を起動する。
   - 確認項目: SQL は `SELECT * FROM 'pf/<sharedEnv>/<stage>/medicalInstitution/+/room/+/event'` とする。
   - 完了条件: event topic への publish で Lambda subscriber が発火する。

6. `DynamoDB ElectroDB Entity`
   - 変更対象: core の DynamoDB entity/repository。
   - 実装内容: `IotStateEntity` を定義し、`topic`, `sessionUid=roomId`, `entityType=room | patient_<patientId>` で保存する。
   - 確認項目: room state payload と patient state payload を upsert できる。
   - 完了条件: Lambda subscriber から room / patient state を保存できる。

7. `Lambda subscriber`
   - 変更対象: functions の IoT event subscriber handler。
   - 実装内容: TopicRule payload を受け、topic segment と payload の `medicalInstitutionId` / `roomId` の整合を確認して DynamoDB に保存する。
   - 確認項目: CloudWatch Logs に受信 topic、event、保存結果が出る。
   - 完了条件: GraphQL mutation publish 後に DynamoDB state が更新される。

8. `GraphQL query 保存結果取得`
   - 変更対象: `packages/functions/src/graphql` の schema/resolver, core repository, `packages/graphql-schema` の生成物。
   - 実装内容: `roomId` を受け取り、topic と `sessionUid=roomId` に対応する room / patient state 一覧を返す。
   - 確認項目: `roomId` 未指定では Web から query を実行しない。
   - 完了条件: Web で対象 room の DynamoDB 保存結果を確認できる。

9. `Web MQTT subscribe`
   - 変更対象: 11-11 Web page / hooks / components。
   - 実装内容: `roomId` 入力、subscribe / unsubscribe、接続状態表示、受信 payload 表示を実装する。
   - 確認項目: `roomId` 未入力時は subscribe しない。
   - 完了条件: backend publish された MQTT payload を Web で受信表示できる。

10. `11-11 Web 検証ページ`
   - 変更対象: 11-11 feature page。
   - 実装内容: MQTT 接続状態、roomId 入力、subscribe 操作、mutation publish、受信一覧、DynamoDB 保存結果一覧を 1 画面にまとめる。
   - 確認項目: Web から MQTT publish しない。
   - 完了条件: subscribe -> mutation publish -> Web 受信 -> Lambda 発火 -> DynamoDB query 確認まで追える。

11. `権限整理`
   - 変更対象: CDK IAM / IoT / Lambda permission。
   - 実装内容: Web MQTT は subscribe のみ、backend Lambda は IoT publish、TopicRule は subscriber Lambda invoke のみに絞る。
   - 確認項目: Lambda permission の source ARN は 11-11 event TopicRule ARN に限定する。
   - 完了条件: Web から MQTT publish できない構成になっている。

12. `検証`
   - 変更対象: なし。
   - 実装内容: typecheck, build, CDK synth/diff, 実環境確認を行う。
   - 確認項目: MQTT subscribe / GraphQL mutation publish / Lambda logs / DynamoDB query が一通り通る。
   - 完了条件: 11-11 の検証フローが成功し、必要なドキュメント差分が `overview.md` に反映済みである。
