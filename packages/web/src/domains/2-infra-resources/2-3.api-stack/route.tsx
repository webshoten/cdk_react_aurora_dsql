import type { RouteObject } from "react-router-dom";
import { InfraResourcePlaceholderPage } from "../pages/infra-resource-placeholder-page.tsx";

export const infraApiStackRoute: RouteObject = {
  path: "overview/2.infra-resources/2-3.api-stack",
  element: <InfraResourcePlaceholderPage id="2-3.api-stack" />,
};
