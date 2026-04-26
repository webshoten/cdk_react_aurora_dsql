import type { CodegenConfig } from "@graphql-codegen/cli";

const schemaUrl = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";

const config: CodegenConfig = {
  overwrite: true,
  schema: schemaUrl,
  documents: ["src/graphql/**/*.graphql"],
  ignoreNoDocuments: false,
  generates: {
    "src/gql/": {
      preset: "client",
    },
  },
};

export default config;
