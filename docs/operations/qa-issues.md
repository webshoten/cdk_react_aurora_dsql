# QA Issues

## 目的

- `pnpm qa` / `qa:*` で検出された既知指摘を継続管理する
- 抑制（suppress/ignore/skip）の根拠と期限を追跡する

## 運用ルール

- 新規指摘は原則として同一タスク内で修正する
- 未解消で残す場合のみ、この台帳に記録する
- 抑制を追加・変更したコミットでは、同一タスクで本台帳を更新する

## 管理項目

- `Rule/Check ID`
- `対象`（Stack/Resource/Path）
- `種別`（static/frontend/backend/infra/security）
- `対応方針`（fix/suppress）
- `理由`
- `チケットID`
- `期限`
- `状態`（open/in-progress/done/suppressed）
- `更新日`

## Entries

| Rule/Check ID | 対象 | 種別 | 対応方針 | 理由 | チケットID | 期限 | 状態 | 更新日 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

