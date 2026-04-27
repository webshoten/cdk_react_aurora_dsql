import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/app-layout.tsx";
import { frontendAuth01Route } from "@/domains/frontend-auth-01/route.tsx";
import { frontendData01Route } from "@/domains/frontend-data-01/route.tsx";
import { frontendData02Route } from "@/domains/frontend-data-02/route.tsx";
import { MainPage } from "@/domains/main/pages/main-page.tsx";

/*
 * # ルーティング定義
 *
 * ## 目的
 * Web 全体のルーティングテーブル。main.tsx の RouterProvider に渡す唯一の Router インスタンス。
 *
 * ## 説明
 * - 既定レイアウトは AppLayout（ヘッダ・ナビ等を含む共通枠）。配下に MainPage と各 domain ルートを置く。
 * - domain ルートは domains/<name>/route.tsx で個別に定義し、ここで束ねる構成。
 * - 未定義パスは "/" へ replace リダイレクト（404 ページなし）。
 */
export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "frontend",
        children: [frontendData01Route, frontendData02Route, frontendAuth01Route],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate replace to="/" />,
  },
]);
