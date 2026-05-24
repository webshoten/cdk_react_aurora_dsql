---
name: architecture-drawio
description: Generate and edit architecture diagrams in draw.io (.drawio) format, then export to SVG for docs and TSX display.
---

# Architecture draw.io Skill

## Goal
- 自然言語の指示から `.drawio` を生成・更新し、`svg` へ変換して `docs` と `tsx` で再利用可能にする。

## Output Contract
- 編集元（正本）: `docs/overview/1.architecture/<name>.drawio`
- 表示用: `docs/overview/1.architecture/<name>.svg`

## Workflow
1. 要件を確認して図に含める要素を列挙する。
2. `.drawio` XML を生成または更新する。
3. `svg` を出力する（原則: Docker）。
4. `docs/overview` と `tsx` から同じ `svg` を参照する。

## Export (Preferred)
- 第一選択: Docker で `.drawio -> .svg` を変換する。
- 例:
  - `docker run --rm -v "$PWD:/data" -w /data rlespinasse/drawio-export <in.drawio> --format svg`
- 補足:
  - `.drawio` 更新後は同一タスクで `.svg` を再生成する。
  - 変換結果は `docs` と `tsx` で同じ `.svg` を参照する。

## Export (Fallback)
- Docker 実行ができない場合:
  - draw.io desktop CLI（`drawio -x -f svg -o <out.svg> <in.drawio>`）を使う
  - または GUI（diagrams.net）で手動エクスポートする

## Troubleshooting (macOS)
- draw.io desktop CLI で `SIGABRT` / `NSApplication` 初期化エラーが出る場合:
  - CLI 運用を停止し、Docker 変換を使う。

## Readability Rule
- 背景色と文字色のコントラストを確保し、重なって読みにくくならない配色を選ぶ。
- 線の交差を最小化し、左→右または上→下の流れで読める配置を優先する。
