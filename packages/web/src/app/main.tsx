import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@/index.css";
import { UrqlProvider } from "@/app/providers/urql-provider.tsx";
import { appRouter } from "@/app/router.tsx";

/*
 * # Web エントリ（React マウント）
 *
 * ## 目的
 * Vite ビルドの index.html から読み込まれる Web 起動点。React ツリーを #root にマウントする。
 *
 * ## 説明
 * StrictMode → UrqlProvider（GraphQL クライアント）→ RouterProvider の順で包む。
 * #root が見つからない場合は早期 throw（HTML が壊れているため復帰不能）。
 */
const root = document.getElementById("root");
if (!root) throw new Error("root not found");

createRoot(root).render(
  <StrictMode>
    <UrqlProvider>
      <RouterProvider router={appRouter} />
    </UrqlProvider>
  </StrictMode>,
);
