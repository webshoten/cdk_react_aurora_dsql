import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/app-layout.tsx";
import { GuardedLayout } from "@/domains/auth/guarded-layout.tsx";
import { LoginPage } from "@/domains/auth/pages/login-page.tsx";
import { DebugPage } from "@/domains/debug/pages/debug-page.tsx";
import { data01Route } from "@/domains/feature-use-cases/11-1.data-01/route.tsx";
import { data02Route } from "@/domains/feature-use-cases/11-2.data-02/route.tsx";
import { auth01Route } from "@/domains/feature-use-cases/11-3.auth-01/route.tsx";
import { auth02Route } from "@/domains/feature-use-cases/11-4.auth-02/route.tsx";
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
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <GuardedLayout />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <MainPage />,
          },
          {
            path: "debug",
            element: <DebugPage />,
          },
          {
            path: "feature-use-cases",
            children: [data01Route, data02Route, auth01Route, auth02Route],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate replace to="/" />,
  },
]);
