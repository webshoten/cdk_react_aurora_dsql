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
| react-doctor/no-prevent-default | `packages/web/src/domains/auth/components/auth-sign-in-form.tsx:19`<br>`packages/web/src/domains/auth/components/auth-new-password-form.tsx:17`<br>`packages/web/src/domains/auth/components/auth-mfa-setup-form.tsx:40`<br>`packages/web/src/domains/auth/components/auth-mfa-setup-form.tsx:70`<br>`packages/web/src/domains/auth/components/auth-mfa-confirm-form.tsx:18`<br>`packages/web/src/domains/debug/pages/debug-page.tsx:107` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| react-doctor/design-no-three-period-ellipsis | `packages/web/src/domains/auth/pages/login-page.tsx:53`<br>`packages/web/src/domains/feature-use-cases/11-1.data-01/components/medical-staff-status-messages.tsx:55`<br>`packages/web/src/domains/auth/guarded-layout.tsx:18`<br>`packages/web/src/domains/feature-use-cases/11-2.data-02/components/image-status-messages.tsx:58` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| react-doctor/prefer-useReducer | `packages/web/src/domains/auth/pages/login-page.tsx:21`<br>`packages/web/src/domains/auth/context/auth-context.tsx:46` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| knip/files | `packages/web/public/config.js`<br>`packages/web/src/shared/ui/placeholder-page.tsx` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| knip/exports (resolveApiUrl) | `packages/web/src/app/config/runtime-config.ts`<br>`packages/web/src/domains/auth/lib/amplify-auth.ts` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| react-doctor/rendering-hydration-mismatch-time | `packages/web/src/domains/feature-use-cases/11-11.iot-01/pages/iot-01-page.tsx:103` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| react-doctor/rerender-state-only-in-handlers | `packages/web/src/domains/auth/pages/login-page.tsx:42` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| react-doctor/no-render-in-render | `packages/web/src/domains/auth/pages/login-page.tsx:135` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| react-doctor/no-react19-deprecated-apis | `packages/web/src/domains/auth/context/auth-context.tsx:3` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| react-doctor/no-cascading-set-state | `packages/web/src/domains/auth/context/auth-context.tsx:88` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| react-doctor/no-usememo-simple-expression | `packages/web/src/domains/feature-use-cases/11-11.iot-01/hooks/use-iot-subscription.ts:35` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| jsx-a11y/heading-has-content | `packages/web/src/shared/ui/card.tsx:28` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |
| react-doctor/design-no-redundant-size-axes | `packages/web/src/domains/feature-use-cases/11-2.data-02/components/images-table.tsx:40` | frontend | fix | Playwright MCP 導入タスクスコープ外、2026-05-15 `pnpm qa:frontend` で検出 | TBD | TBD | open | 2026-05-15 |

