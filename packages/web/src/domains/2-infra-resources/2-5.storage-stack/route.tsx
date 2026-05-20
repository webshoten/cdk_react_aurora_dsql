import type { RouteObject } from "react-router-dom";
import { InfraResourcePlaceholderPage } from "../pages/infra-resource-placeholder-page.tsx";

export const infraStorageStackRoute: RouteObject = {
  path: "overview/2.infra-resources/2-5.storage-stack",
  element: <InfraResourcePlaceholderPage id="2-5.storage-stack" />,
};
