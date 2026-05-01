import { listImages, registerImage } from "@pf/core";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { GraphqlContext } from "../context.ts";

/*
 * ## 目的
 * 画像一覧を返す。
 *
 * ## 説明
 * 各画像へ署名付きダウンロードURLを付与して返却する。
 */
export async function resolveImages(context: GraphqlContext): Promise<
  {
    contentType: string;
    downloadUrl: string;
    fileName: string;
    imageId: string;
    imagePath: string;
    sizeBytes: number;
  }[]
> {
  const rows = await listImages(context.dbClient);
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      downloadUrl: await getSignedUrl(
        context.s3Client,
        new GetObjectCommand({
          Bucket: context.imageBucket,
          Key: row.imagePath,
        }),
        {
          expiresIn: context.presignedUrlExpiresSeconds,
        },
      ),
    })),
  );
}

/*
 * ## 目的
 * 画像アップロード用URLを発行する。
 *
 * ## 説明
 * 画像パスを生成し、PUT 用の署名付きURLを返す。
 */
export async function resolveCreateImageUploadUrl(
  context: GraphqlContext,
  args: { contentType: string; fileName: string },
): Promise<{ imagePath: string; uploadUrl: string }> {
  const imagePath = buildImagePath(context.imagePrefix, args.fileName);
  const uploadUrl = await getSignedUrl(
    context.s3Client,
    new PutObjectCommand({
      Bucket: context.imageBucket,
      Key: imagePath,
      ContentType: args.contentType,
    }),
    {
      expiresIn: context.presignedUrlExpiresSeconds,
    },
  );

  return {
    imagePath,
    uploadUrl,
  };
}

/*
 * ## 目的
 * アップロード済み画像のメタデータを登録する。
 *
 * ## 説明
 * DB 登録件数を payload 形式で返す。
 */
export async function resolveRegisterImage(
  context: GraphqlContext,
  args: { contentType: string; fileName: string; imagePath: string; sizeBytes: number },
): Promise<{ appliedCount: number }> {
  return {
    appliedCount: await registerImage(context.dbClient, {
      imagePath: args.imagePath,
      fileName: args.fileName,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
    }),
  };
}

/*
 * ## 目的
 * 保存先画像パスを生成する。
 *
 * ## 説明
 * ファイル名をサニタイズし、prefix + 時刻 + 乱数で一意化する。
 */
function buildImagePath(imagePrefix: string, fileName: string): string {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${imagePrefix}${Date.now()}-${Math.floor(Math.random() * 10000)}-${sanitizedName}`;
}
