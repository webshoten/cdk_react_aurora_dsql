# 17. Verification

## 検証フェーズの目的
- 実装結果が要件・設計どおりかを確認し、リリース判断に必要な根拠を残す。

## テスト
- テストコード
  - TBD
- E2Eテスト / E2Eテストコード
  - TBD

## Quality Gate(s)
- 実行方針
  - 実装後は、変更対象に応じた QA を機械実行して結果を記録する。
  - 推測で成功扱いにせず、コマンド実行結果を根拠に判定する。
  - 失敗時は原因と失敗コマンドを明示し、未解消のまま完了扱いにしない。
- QA 実行ルール
  - 常時実行: `pnpm qa:static` と `pnpm qa:base`
  - `packages/web` のみ変更: `pnpm qa:frontend` を追加実行
  - `packages/functions` または `packages/core` のみ変更: `pnpm qa:backend` を追加実行
  - `packages/infra` のみ変更: `pnpm qa:infra` を追加実行（`CDK_SHARED_ENV` 必須）
  - 認証/認可/秘密情報/IAM/ネットワーク変更: `pnpm qa:security` を追加実行
  - 複数領域変更や統合確認: `pnpm qa:full` を実行
- QA 指摘の扱い
  - QA運用は「新規指摘を実装時に解消する」を原則とする。
  - `qa:*` で新規指摘が出た場合は、同一タスク内で修正してから完了報告する。
  - 例外的に未解消で残す場合は、抑制設定または台帳に理由・チケットID・期限を必ず記載する。
  - 理由なし抑制（ignore/suppress/skip）の追加は禁止する。
  - 既知指摘は `docs/operations/qa-issues.md` で管理し、段階的に解消する。
  - 台帳の必須項目は `Rule/Check ID`、`対象`、`対応方針`、`理由`、`チケットID`、`期限`、`状態` とする。
  - 抑制（suppress/ignore/skip）を追加・変更する場合は、同一タスクで台帳更新を必須とする。
  - `qa:infra` の `cdk-nag` も同じ原則に従う。

## レビュー
- 観点
  - 要件・設計・実装・検証結果を照らし合わせ、矛盾がないことを確認する。
  - ユーザーが実動作確認を実施したかを確認する（`deploy` または `local`）。
  - token / credential / 秘密情報（APIキー・秘密鍵・パスワード等）がコードやリポジトリ管理対象に混入していないことを確認する。
- 報告
  - レビュー報告は `Findings（重大度順） -> 根拠ファイル -> 影響 -> 修正案` を基本とする。
  - 問題なしの場合も、未確認範囲と残リスクを明記する。
  - 未確認事項を断定しない。事実と推測を分離し、未確認は未確認と明記する。

## 関連ドキュメント
- 要件: `docs/overview/14.requirement/overview.md`
- 設計: `docs/overview/15.design/overview.md`
- 実装: `docs/overview/16.implementation/overview.md`
