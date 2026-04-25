import { createYoga } from "graphql-yoga";
import { createGraphqlContext } from "./context.ts";
import { schema } from "./schema.ts";

export const yoga = createYoga({
  context: async () => createGraphqlContext(),
  graphqlEndpoint: "/graphql",
  landingPage: false,
  schema,
});
