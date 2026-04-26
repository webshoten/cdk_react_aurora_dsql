import type { PropsWithChildren } from "react";
import { WebConfigContext, type WebConfigContextValue } from "@/app/providers/web-config-context.tsx";

interface WebConfigProviderProps extends PropsWithChildren {
  value: WebConfigContextValue;
}

export function WebConfigProvider({ children, value }: WebConfigProviderProps) {
  return <WebConfigContext.Provider value={value}>{children}</WebConfigContext.Provider>;
}
