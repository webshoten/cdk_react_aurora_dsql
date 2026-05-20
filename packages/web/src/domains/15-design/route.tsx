import type { RouteObject } from "react-router-dom";
import { DesignPage } from "./pages/design-page.tsx";

export const designRoute: RouteObject = {
  path: "overview/15.design",
  element: <DesignPage />,
};
