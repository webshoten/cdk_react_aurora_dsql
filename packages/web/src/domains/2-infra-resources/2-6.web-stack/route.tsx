import type { RouteObject } from "react-router-dom";
import { InfraResourcePlaceholderPage } from "../pages/infra-resource-placeholder-page.tsx";

export const infraWebStackRoute: RouteObject = {
  path: "overview/2.infra-resources/2-6.web-stack",
  element: <InfraResourcePlaceholderPage id="2-6.web-stack" />,
};
