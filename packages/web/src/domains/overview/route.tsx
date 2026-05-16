import type { RouteObject } from "react-router-dom";
import { OverviewReferencePage } from "./pages/overview-reference-page.tsx";

/*
 * # overview ルート定義
 *
 * ## 目的
 * overview(14-17) の参照ページをルーティングへ追加する。
 */
export const overviewRoutes: RouteObject[] = [
  {
    path: "overview/14.requirement",
    element: (
      <OverviewReferencePage
        description="要件フェーズの正本"
        docPath="docs/overview/14.requirement/overview.md"
        title="14.requirement"
      />
    ),
  },
  {
    path: "overview/15.design",
    element: (
      <OverviewReferencePage
        description="設計フェーズの正本"
        docPath="docs/overview/15.design/overview.md"
        title="15.design"
      />
    ),
  },
  {
    path: "overview/16.implementation",
    element: (
      <OverviewReferencePage
        description="実装フェーズの正本"
        docPath="docs/overview/16.implementation/overview.md"
        title="16.implementation"
      />
    ),
  },
  {
    path: "overview/17.verification",
    element: (
      <OverviewReferencePage
        description="検証フェーズの正本"
        docPath="docs/overview/17.verification/overview.md"
        title="17.verification"
      />
    ),
  },
];
