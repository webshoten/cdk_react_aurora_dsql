import type { RouteObject } from "react-router-dom";
import { Auth02Page } from "./pages/auth-02-page.tsx";

/*
 * # 11-4.auth-02 ルート定義
 *
 * ## 目的
 * 認証状態遷移と auth-02 検証仕様ページを /feature-use-cases 配下へ組み込む。
 */
export const auth02Route: RouteObject = {
  path: "11-4.auth-02",
  element: <Auth02Page />,
};
