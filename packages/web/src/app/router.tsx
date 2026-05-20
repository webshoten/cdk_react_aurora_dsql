import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/app-layout.tsx";
import { architectureRoute } from "@/domains/1-architecture/route.tsx";
import { requirementRoute } from "@/domains/14-requirement/route.tsx";
import { designRoute } from "@/domains/15-design/route.tsx";
import { implementationRoute } from "@/domains/16-implementation/route.tsx";
import { verificationRoute } from "@/domains/17-verification/route.tsx";
import { aiRoute } from "@/domains/9-ai/route.tsx";
import { GuardedLayout } from "@/domains/auth/guarded-layout.tsx";
import { LoginPage } from "@/domains/auth/pages/login-page.tsx";
import { debugRoute } from "@/domains/debug/route.tsx";
import { data01Route } from "@/domains/feature-use-cases/11-1.data-01/route.tsx";
import { data02Route } from "@/domains/feature-use-cases/11-2.data-02/route.tsx";
import { auth01Route } from "@/domains/feature-use-cases/11-3.auth-01/route.tsx";
import { auth02Route } from "@/domains/feature-use-cases/11-4.auth-02/route.tsx";
import { iot01Route } from "@/domains/feature-use-cases/11-11.iot-01/route.tsx";
import { mainRoute } from "@/domains/main/route.tsx";

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
          mainRoute,
          debugRoute,
          aiRoute,
          architectureRoute,
          requirementRoute,
          designRoute,
          implementationRoute,
          verificationRoute,
          {
            path: "feature-use-cases",
            children: [data01Route, data02Route, auth01Route, auth02Route, iot01Route],
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
