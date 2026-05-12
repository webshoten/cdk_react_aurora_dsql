CREATE TABLE "images" (
	"image_id" text PRIMARY KEY NOT NULL,
	"image_path" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "images_image_path_unique" UNIQUE("image_path")
);
