# AGENTS.md

## 目的
このファイルは、このリポジトリで作業するコーディングエージェント向けの必須手順を定義します。

## 作業開始時の必須手順
1. 実装前に `docs/overview/14.requirement/overview.md` / `docs/overview/15.design/overview.md` / `docs/overview/16.implementation/overview.md` / `docs/overview/17.verification/overview.md` を確認する。
2. 今回のタスクで守るルールを短く要約して宣言する。
3. 1 と 2 が終わるまで編集を開始しない。

## 実行ルール
0. 開発はフェーズ（要件確認 / 設計 / 実装 / 検証）で進める。
1. フェーズを次に進めるには、必ずユーザーの明示承認を得る。
2. 明示承認がない限り、現在フェーズで停止する。
3. 「進める」「お願いします」など解釈が分かれる表現は次フェーズ承認として扱わず、確認してから進む。
3.1 軽微な調査・確認（コード変更なし、情報確認のみ）はフェーズ進行（要件確認 / 設計 / 実装 / 検証）の対象外とする。
3.2 軽微な調査・確認では、実施開始の承認を得た後に調査して結果報告する。
3.3 軽微な調査・確認中にコード変更が必要になった時点で、通常のフェーズ進行ルールへ切り替える。
4. フェーズ別の詳細ルールは `docs/overview/14.requirement/overview.md` / `docs/overview/15.design/overview.md` / `docs/overview/16.implementation/overview.md` / `docs/overview/17.verification/overview.md` を正本とし、必ず従う。
5. AGENTS.md と各 overview 正本の内容が競合して見える場合は、独断で解釈せずユーザーに確認する。
6. Codex と Claude の両方を利用する前提で、`AGENTS.md` と `CLAUDE.md` の内容は常に同期して維持する。
7. 片方だけ更新する場合は、同一タスクで必ずもう片方も更新する。
8. コード変更後は、変更対象に応じて `qa:*` を実行し、結果を報告する。
9. QA 実行ルールは次を基本とする。
   - 常時実行: `pnpm qa:static` と `pnpm qa:base`
   - ドキュメントのみ変更（例: `docs/**/*.md`, `*.drawio`, `*.svg`）: `pnpm qa:base` は必須対象外
   - `packages/web` のみ変更: `pnpm qa:frontend` を追加実行する
   - `packages/functions` または `packages/core` のみ変更: `pnpm qa:backend` を追加実行する
   - `packages/infra` のみ変更: `pnpm qa:infra` を追加実行する（`CDK_SHARED_ENV` 必須）
   - 認証/認可/秘密情報/IAM/ネットワーク変更: `pnpm qa:security` を追加実行する
   - 複数領域変更や統合確認: `pnpm qa:full` を実行する

## コーディング原則
出典: https://github.com/multica-ai/andrej-karpathy-skills （MIT License）。Andrej Karpathy の LLM コーディング指針から、既存ルールで未カバーの2原則を採用。

### 簡潔優先（Simplicity First）
- 要求された範囲のみ実装。投機的機能・未要求の設定可能性を足さない。
- 単一用途コードに抽象化を作らない。
- 起こり得ないケースのエラーハンドリングを書かない。
- 「シニアエンジニアが過剰と言うか？」→ Yes なら簡素化する。

### 外科的変更（Surgical Changes）
- 必要な箇所のみ触る。隣接コード・コメント・整形を勝手に改善しない。
- 壊れていないものをリファクタしない。既存スタイルを維持する。
- 自分の変更が生んだ未使用 import/変数のみ削除。既存 dead code は消さず報告する。
- 全変更行がユーザー要求に直接たどれること。

## コミュニケーションルール
- ユーザーの質問・依頼の意図が抽象的な場合は、推測で進めず、質問して意図を明確化してから進める。
- 意図が複数解釈できる表現は、解釈を固定せず確認を取る。

## 編集前チェック（宣言必須）
1. 変更対象ファイル
2. 適用する overview 項目
3. その配置・実装方針が妥当な理由

## 編集後チェック（報告必須）
1. 何を変更したか
2. どのルールを確認したか
3. 残っている曖昧点・リスク

## 優先順位
1. ユーザーの明示指示
2. この `AGENTS.md`
3. `docs/overview/14.requirement/overview.md` / `docs/overview/15.design/overview.md` / `docs/overview/16.implementation/overview.md` / `docs/overview/17.verification/overview.md`
4. 変更対象モジュールの既存慣習

## 運用メモ
- 新しいルールが必要な場合は、まず最小追記案を提案する。
- 明示依頼がない限り、広範囲な規約変更は行わない。
