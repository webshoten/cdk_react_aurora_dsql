import type { RouteObject } from "react-router-dom";
import { InfraResourcesPage } from "./pages/infra-resources-page.tsx";
import { infraSharedStackRoute } from "./2-1.shared-stack/route.tsx";
import { infraDbStackRoute } from "./2-2.db-stack/route.tsx";
import { infraApiStackRoute } from "./2-3.api-stack/route.tsx";
import { infraOpsStackRoute } from "./2-4.ops-stack/route.tsx";
import { infraStorageStackRoute } from "./2-5.storage-stack/route.tsx";
import { infraWebStackRoute } from "./2-6.web-stack/route.tsx";
import { infraAuthStackRoute } from "./2-7.auth-stack/route.tsx";
import { infraDomainRoute } from "./2-8.domain/route.tsx";

export const infraResourcesRoute: RouteObject = {
  path: "overview/2.infra-resources",
  element: <InfraResourcesPage />,
  children: [],
};

export const infraResourceChildRoutes: RouteObject[] = [
  infraSharedStackRoute,
  infraDbStackRoute,
  infraApiStackRoute,
  infraOpsStackRoute,
  infraStorageStackRoute,
  infraWebStackRoute,
  infraAuthStackRoute,
  infraDomainRoute,
];
