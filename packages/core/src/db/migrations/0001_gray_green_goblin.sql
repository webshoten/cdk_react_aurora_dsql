CREATE TABLE "medical_staffs" (
	"staff_code" text PRIMARY KEY NOT NULL,
	"institution_code" text NOT NULL,
	"name" text NOT NULL,
	"profession" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
