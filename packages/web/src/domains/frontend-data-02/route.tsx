import type { RouteObject } from "react-router-dom";
import { Data02Page } from "./pages/data-02-page.tsx";

/*
 * # frontend-data-02 ルート定義
 *
 * ## 目的
 * 4-2.data-02 ページを /frontend 配下に組み込むためのルート descriptor。router.tsx が束ねる。
 */
export const frontendData02Route: RouteObject = {
  path: "4-2.data-02",
  element: <Data02Page />,
};
