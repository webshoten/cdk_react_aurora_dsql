import type { RouteObject } from "react-router-dom";
import { AiPage } from "./pages/ai-page.tsx";

/*
 * # 9-ai ルート定義
 *
 * ## 目的
 * AI（MCP/Skill）設計の可視化ページ「9. AI」を /9-ai に組み込むためのルート descriptor。
 * router.tsx が束ねる。
 */
export const aiRoute: RouteObject = {
  path: "9-ai",
  element: <AiPage />,
};
