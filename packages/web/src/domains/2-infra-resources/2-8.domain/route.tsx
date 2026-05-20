import type { RouteObject } from "react-router-dom";
import { InfraResourcePlaceholderPage } from "../pages/infra-resource-placeholder-page.tsx";

export const infraDomainRoute: RouteObject = {
  path: "overview/2.infra-resources/2-8.domain",
  element: <InfraResourcePlaceholderPage id="2-8.domain" />,
};
