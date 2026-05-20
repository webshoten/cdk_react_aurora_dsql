import type { RouteObject } from "react-router-dom";
import { InfraResourcePlaceholderPage } from "../pages/infra-resource-placeholder-page.tsx";

export const infraDbStackRoute: RouteObject = {
  path: "overview/2.infra-resources/2-2.db-stack",
  element: <InfraResourcePlaceholderPage id="2-2.db-stack" />,
};
