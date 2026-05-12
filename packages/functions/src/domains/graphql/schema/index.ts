import SchemaBuilder from "@pothos/core";
import { registerImageSchema } from "@functions/domains/image/schema.ts";
import { registerMedicalStaffSchema } from "@functions/domains/medical-staff/schema.ts";
import { registerRealtimeSchema } from "@functions/domains/realtime/schema.ts";
import { registerSeedItemsSchema } from "@functions/domains/seed-items/schema.ts";
import { registerUsersSchema } from "@functions/domains/users/schema.ts";
import type { GraphqlContext } from "@functions/shared/context/graphql-context.ts";
import type { AppSchemaBuilder } from "./types.ts";

const builder: AppSchemaBuilder = new SchemaBuilder<{
  Context: GraphqlContext;
}>({});

builder.queryType({});
builder.mutationType({});

registerUsersSchema(builder);
registerSeedItemsSchema(builder);
registerMedicalStaffSchema(builder);
registerImageSchema(builder);
registerRealtimeSchema(builder);

export const schema = builder.toSchema();
