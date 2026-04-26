import { Navigate, createBrowserRouter } from "react-router-dom";
import { frontendAuth01Route } from "@/domains/frontend-auth-01/route.tsx";
import { frontendData01Route } from "@/domains/frontend-data-01/route.tsx";
import { frontendData02Route } from "@/domains/frontend-data-02/route.tsx";
import { AppLayout } from "@/app/layout/app-layout.tsx";

export const appRouter = createBrowserRouter([
  {
    path: "/frontend",
    element: <AppLayout />,
    children: [frontendData01Route, frontendData02Route, frontendAuth01Route],
  },
  {
    path: "*",
    element: <Navigate replace to="/frontend/4-1.data-01" />,
  },
]);
