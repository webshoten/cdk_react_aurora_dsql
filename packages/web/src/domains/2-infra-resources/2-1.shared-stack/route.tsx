import type { RouteObject } from "react-router-dom";
import { InfraResourcePlaceholderPage } from "../pages/infra-resource-placeholder-page.tsx";

export const infraSharedStackRoute: RouteObject = {
  path: "overview/2.infra-resources/2-1.shared-stack",
  element: <InfraResourcePlaceholderPage id="2-1.shared-stack" />,
};
