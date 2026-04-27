import type { RouteObject } from "react-router-dom";
import { Data01Page } from "./pages/data-01-page.tsx";

/*
 * # 11-1.data-01 ルート定義
 *
 * ## 目的
 * GraphQL 経由のデータ表示・ミューテーション動作確認ページ（11-1.data-01）を /feature-use-cases 配下に組み込むためのルート descriptor。router.tsx が束ねる。
 */
export const data01Route: RouteObject = {
  path: "11-1.data-01",
  element: <Data01Page />,
};
