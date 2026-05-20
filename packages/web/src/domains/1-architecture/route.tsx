import type { RouteObject } from "react-router-dom";
import { ArchitecturePage } from "./pages/architecture-page.tsx";

/*
 * # 1-architecture ルート定義
 *
 * ## 目的
 * 全体アーキテクチャ可視化ページを /overview/1.architecture に組み込む。
 */
export const architectureRoute: RouteObject = {
  path: "overview/1.architecture",
  element: <ArchitecturePage />,
};
