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
3. `svg` を出力する（原則: draw.io desktop CLI）。
4. `docs/overview` と `tsx` から同じ `svg` を参照する。

## Export (Preferred)
- 第一選択: draw.io desktop CLI で `.drawio -> .svg` を変換する。
- macOS 推奨:
  - `drawio -x -f svg -o <out.svg> <in.drawio>`
- 補足:
  - `-x`（export）を必ず使い、GUI起動系オプションを避ける。
  - 生成専用で使い、編集中のGUIインスタンスとは分離する。

## Export (Fallback)
- draw.io desktop CLI がない場合:
  - Docker の headless drawio を使う
  - または GUI（diagrams.net）で手動エクスポートする

## Troubleshooting (macOS)
- `SIGABRT` / `NSApplication` 初期化で落ちる場合:
  - GUIアプリを一度終了してから CLI を再実行する。
  - `drawio -x -f svg -o <out.svg> <in.drawio>` を使い、`--export` 形式より `-x` を優先する。
  - GUI編集は draw.io.app、変換は CLI と役割を分離して同時実行を避ける。

## Readability Rule
- 背景色と文字色のコントラストを確保し、重なって読みにくくならない配色を選ぶ。
- 線の交差を最小化し、左→右または上→下の流れで読める配置を優先する。
