import { useContext } from "react";
import { WebConfigContext } from "@/app/providers/web-config-context.tsx";

export function useWebConfig() {
  const context = useContext(WebConfigContext);

  if (!context) {
    throw new Error("WebConfigContext is not provided");
  }

  return context;
}
