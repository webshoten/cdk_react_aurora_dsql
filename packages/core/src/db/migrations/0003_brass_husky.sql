CREATE TABLE "users" (
  "uid" text PRIMARY KEY NOT NULL,
  "username" text NOT NULL,
  "email" text NOT NULL,
  "user_type" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_username_unique" UNIQUE("username")
);
