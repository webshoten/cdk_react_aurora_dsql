# 2-9. RealtimeStack

## 対象

- `RealtimeStack`
- iot-02 の IoT メッセージ保存経路

## 責務

- リアルタイム機能で発生する IoT メッセージの保存経路を提供する
- `IoT Rule -> Firehose -> S3` の本線を Realtime 機能責務として管理する

## 管理リソース

- `AWS::IoT::TopicRule`（iot-02 対象 topic の検知と Firehose 連携）
- `AWS::KinesisFirehose::DeliveryStream`（S3 配信）
- `AWS::S3::Bucket`（Telemetry メッセージ保存）

## 構成方針

- Stack 分割はリソース種別ではなく機能責務を優先する
- iot-02 の保存経路は Realtime 機能と同時に変更されるため RealtimeStack に配置する
- `StorageStack` は画像用途に限定し、Realtime 保存経路とは分離する

## 決定ログ

- 2026-05-23: iot-02 の保存経路（IoT Rule / Firehose / S3）を Realtime 機能責務として RealtimeStack で管理する方針を追加
