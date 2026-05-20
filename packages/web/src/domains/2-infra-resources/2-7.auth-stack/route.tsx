import type { RouteObject } from "react-router-dom";
import { InfraResourcePlaceholderPage } from "../pages/infra-resource-placeholder-page.tsx";

export const infraAuthStackRoute: RouteObject = {
  path: "overview/2.infra-resources/2-7.auth-stack",
  element: <InfraResourcePlaceholderPage id="2-7.auth-stack" />,
};
