import type { RouteObject } from "react-router-dom";
import { Data02Page } from "./pages/data-02-page.tsx";

/*
 * # 11-2.data-02 ルート定義
 *
 * ## 目的
 * 11-2.data-02 ページを /feature-use-cases 配下に組み込むためのルート descriptor。router.tsx が束ねる。
 */
export const data02Route: RouteObject = {
  path: "11-2.data-02",
  element: <Data02Page />,
};
