import { createContext } from "react";

export interface WebConfigContextValue {
  configError: string | null;
}

export const WebConfigContext = createContext<WebConfigContextValue | null>(null);
