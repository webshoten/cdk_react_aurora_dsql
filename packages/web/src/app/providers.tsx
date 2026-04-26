import type { PropsWithChildren } from "react";
import { cacheExchange, createClient, fetchExchange, Provider } from "urql";
import { resolveGraphqlUrl } from "@/app/providers/runtime-config.ts";
import { WebConfigProvider } from "@/app/providers/web-config-provider.tsx";

const graphqlUrl = resolveGraphqlUrl();
const configError = graphqlUrl ? null : "config.js の apiUrl が未設定";

const client = createClient({
  exchanges: [cacheExchange, fetchExchange],
  url: graphqlUrl ?? "http://localhost:0/graphql",
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider value={client}>
      <WebConfigProvider value={{ configError }}>{children}</WebConfigProvider>
    </Provider>
  );
}
