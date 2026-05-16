import type { RouteObject } from "react-router-dom";
import { MainPage } from "./pages/main-page.tsx";

/*
 * # main ルート定義
 *
 * ## 目的
 * トップページを "/" の index ルートとして組み込むためのルート descriptor。router.tsx が束ねる。
 */
export const mainRoute: RouteObject = {
  index: true,
  element: <MainPage />,
};
