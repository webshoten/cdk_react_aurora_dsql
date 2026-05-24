import type { RouteObject } from "react-router-dom";
import { data01Route } from "./11-1.data-01/route.tsx";
import { data02Route } from "./11-2.data-02/route.tsx";
import { auth01Route } from "./11-3.auth-01/route.tsx";
import { auth02Route } from "./11-4.auth-02/route.tsx";
import { iot01Route } from "./11-11.iot-01/route.tsx";
import { FeatureUseCasesPage } from "./pages/feature-use-cases-page.tsx";

export const featureUseCasesRoute: RouteObject = {
  path: "overview/11.feature-use-cases",
  element: <FeatureUseCasesPage />,
};

export const featureUseCasesChildRoutes: RouteObject[] = [
  data01Route,
  data02Route,
  auth01Route,
  auth02Route,
  iot01Route,
];
