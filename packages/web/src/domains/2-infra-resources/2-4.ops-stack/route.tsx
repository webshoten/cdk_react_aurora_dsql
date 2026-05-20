import type { RouteObject } from "react-router-dom";
import { InfraResourcePlaceholderPage } from "../pages/infra-resource-placeholder-page.tsx";

export const infraOpsStackRoute: RouteObject = {
  path: "overview/2.infra-resources/2-4.ops-stack",
  element: <InfraResourcePlaceholderPage id="2-4.ops-stack" />,
};
