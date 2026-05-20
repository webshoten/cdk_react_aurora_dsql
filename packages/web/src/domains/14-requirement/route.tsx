import type { RouteObject } from "react-router-dom";
import { RequirementPage } from "./pages/requirement-page.tsx";

export const requirementRoute: RouteObject = {
  path: "overview/14.requirement",
  element: <RequirementPage />,
};
