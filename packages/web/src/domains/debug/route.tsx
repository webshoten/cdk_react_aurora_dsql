import type { RouteObject } from "react-router-dom";
import { DebugPage } from "./pages/debug-page.tsx";

/*
 * # debug ルート定義
 *
 * ## 目的
 * デバッグページを /debug に組み込むためのルート descriptor。router.tsx が束ねる。
 */
export const debugRoute: RouteObject = {
  path: "debug",
  element: <DebugPage />,
};
