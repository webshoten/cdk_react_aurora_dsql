CREATE TABLE "demo_seed_items" (
	"code" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
