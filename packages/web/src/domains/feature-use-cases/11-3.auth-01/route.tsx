import type { RouteObject } from "react-router-dom";
import { Auth01Page } from "./pages/auth-01-page.tsx";

/*
 * # 11-3.auth-01 ルート定義
 *
 * ## 目的
 * 認証ドメインの初期実装ページ（11-3.auth-01）を /feature-use-cases 配下に組み込むためのルート descriptor。router.tsx が束ねる。
 */
export const auth01Route: RouteObject = {
  path: "11-3.auth-01",
  element: <Auth01Page />,
};
