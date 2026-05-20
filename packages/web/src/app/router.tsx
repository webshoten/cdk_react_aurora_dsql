import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/app-layout.tsx";
import { architectureRoute } from "@/domains/1-architecture/route.tsx";
import { featureUseCasesChildRoutes, featureUseCasesRoute } from "@/domains/11-feature-use-cases/route.tsx";
import { infraResourceChildRoutes, infraResourcesRoute } from "@/domains/2-infra-resources/route.tsx";
import { requirementRoute } from "@/domains/14-requirement/route.tsx";
import { designRoute } from "@/domains/15-design/route.tsx";
import { implementationRoute } from "@/domains/16-implementation/route.tsx";
import { verificationRoute } from "@/domains/17-verification/route.tsx";
import { aiRoute } from "@/domains/9-ai/route.tsx";
import { GuardedLayout } from "@/domains/auth/guarded-layout.tsx";
import { LoginPage } from "@/domains/auth/pages/login-page.tsx";
import { debugRoute } from "@/domains/debug/route.tsx";
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
          infraResourcesRoute,
          ...infraResourceChildRoutes,
          requirementRoute,
          designRoute,
          implementationRoute,
          verificationRoute,
          featureUseCasesRoute,
          ...featureUseCasesChildRoutes,
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate replace to="/" />,
  },
]);
