import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@/index.css";
import { AppProviders } from "@/app/providers.tsx";
import { appRouter } from "@/app/router.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("root not found");

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  </StrictMode>,
);
