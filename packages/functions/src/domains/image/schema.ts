import type { AppSchemaBuilder } from "@functions/domains/graphql/schema/types.ts";
import {
  resolveCreateImageUploadUrl,
  resolveImages,
  resolveRegisterImage,
} from "@functions/domains/image/resolver.ts";

export function registerImageSchema(builder: AppSchemaBuilder): void {
  const ImageRef = builder.objectRef<{
    contentType: string;
    downloadUrl: string;
    fileName: string;
    imageId: string;
    imagePath: string;
    sizeBytes: number;
  }>("Image");
  const PresignedUploadPayloadRef = builder.objectRef<{ imagePath: string; uploadUrl: string }>(
    "PresignedUploadPayload",
  );
  const RegisterImagePayloadRef = builder.objectRef<{ appliedCount: number }>(
    "RegisterImagePayload",
  );

  ImageRef.implement({
    fields: (t) => ({
      imageId: t.exposeString("imageId", { description: "画像ID。" }),
      imagePath: t.exposeString("imagePath", { description: "S3 上の画像パス。" }),
      fileName: t.exposeString("fileName", { description: "元ファイル名。" }),
      contentType: t.exposeString("contentType", { description: "MIME type。" }),
      sizeBytes: t.exposeInt("sizeBytes", { description: "ファイルサイズ（byte）。" }),
      downloadUrl: t.exposeString("downloadUrl", { description: "署名付きダウンロードURL。" }),
    }),
  });

  PresignedUploadPayloadRef.implement({
    fields: (t) => ({
      imagePath: t.exposeString("imagePath", { description: "アップロード先画像パス。" }),
      uploadUrl: t.exposeString("uploadUrl", { description: "署名付きアップロードURL。" }),
    }),
  });

  RegisterImagePayloadRef.implement({
    fields: (t) => ({
      appliedCount: t.exposeInt("appliedCount", { description: "反映件数。" }),
    }),
  });

  builder.queryField("images", (t) =>
    t.field({
      description: "画像メタデータ一覧を返し、各行に署名付きダウンロードURLを付与する。",
      type: [ImageRef],
      resolve: async (_root, _args, context) => resolveImages(context),
    }),
  );

  builder.mutationField("createImageUploadUrl", (t) =>
    t.field({
      description: "画像アップロード用の署名付きURLを発行する。",
      type: PresignedUploadPayloadRef,
      args: {
        contentType: t.arg.string({ required: true }),
        fileName: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => resolveCreateImageUploadUrl(context, args),
    }),
  );

  builder.mutationField("registerImage", (t) =>
    t.field({
      description: "アップロード済み画像のメタデータを登録する。",
      type: RegisterImagePayloadRef,
      args: {
        contentType: t.arg.string({ required: true }),
        fileName: t.arg.string({ required: true }),
        imagePath: t.arg.string({ required: true }),
        sizeBytes: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, context) => resolveRegisterImage(context, args),
    }),
  );
}
