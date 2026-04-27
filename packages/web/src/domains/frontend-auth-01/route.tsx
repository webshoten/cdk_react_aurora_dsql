import type { RouteObject } from "react-router-dom";
import { Auth01Page } from "./pages/auth-01-page.tsx";

/*
 * # frontend-auth-01 ルート定義
 *
 * ## 目的
 * 認証ドメインの初期実装ページ（4-3.auth-01）を /frontend 配下に組み込むためのルート descriptor。router.tsx が束ねる。
 */
export const frontendAuth01Route: RouteObject = {
  path: "4-3.auth-01",
  element: <Auth01Page />,
};
