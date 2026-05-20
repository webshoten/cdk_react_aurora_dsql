# 9-2. architecture-drawio

## 対象

- draw.io（`.drawio`）でのアーキテクチャ図作成
- `svg` 変換後の docs / tsx での再利用

## 目的

- 自然言語から図を生成・更新し、図の作成コストを下げる
- 図の編集元を `.drawio` に統一し、表示先（md/tsx）で同じ `svg` を使い回す

## 運用ルール

- 正本は `docs/architecture/*.drawio` とする
- 表示用は `docs/architecture/*.svg` とする
- 変換手段（draw.io CLI / Docker など）は環境に応じて選ぶ
- `docs/overview` と `tsx` は同一 `svg` を参照し、二重管理しない

## Skill

- 配置先
  - Codex（repo）: `.agents/skills/architecture-drawio/SKILL.md`
  - Codex（global）: `~/.codex/skills/architecture-drawio/SKILL.md`
  - Claude: `~/.claude/skills/architecture-drawio/SKILL.md`
- Skill 名: `architecture-drawio`
- 方式: draw.io XML を直接生成・更新する
