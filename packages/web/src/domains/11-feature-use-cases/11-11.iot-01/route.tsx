import type { RouteObject } from "react-router-dom";
import { Iot01Page } from "./pages/iot-01-page.tsx";

/*
 * # 11-11.iot-01 ルート定義
 *
 * ## 目的
 * MQTT subscribe 検証ページを /overview/11.feature-use-cases 配下へ接続する。
 */
export const iot01Route: RouteObject = {
  path: "overview/11.feature-use-cases/11-11.iot-01",
  element: <Iot01Page />,
};
