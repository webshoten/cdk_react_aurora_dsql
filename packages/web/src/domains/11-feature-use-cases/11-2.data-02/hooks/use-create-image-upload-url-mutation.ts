import { useTypedMutation } from "@pf/graphql-schema/urql";

/*
 * # 画像アップロード URL 発行 Mutation フック
 *
 * ## 目的
 * 11-2.data-02 で S3 PUT 用の presigned URL を取得する。
 */
export function useCreateImageUploadUrlMutation() {
  return useTypedMutation((variables: { contentType: string; fileName: string }) => ({
    createImageUploadUrl: {
      __args: {
        contentType: variables.contentType,
        fileName: variables.fileName,
      },
      imagePath: true,
      uploadUrl: true,
    },
  }));
}
