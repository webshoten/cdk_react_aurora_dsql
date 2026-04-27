import type { MutationResult } from "@pf/graphql/genql";
import { useTypedMutation } from "@pf/graphql/urql";

interface CreateImageUploadUrlVariables {
  contentType: string;
  fileName: string;
}

type CreateImageUploadUrlMutation = {
  createImageUploadUrl: {
    __args: {
      contentType: string;
      fileName: string;
    };
    imagePath: true;
    uploadUrl: true;
  };
};

type CreateImageUploadUrlData = MutationResult<CreateImageUploadUrlMutation>;

/*
 * # 画像アップロード URL 発行 Mutation フック
 *
 * ## 目的
 * 11-2.data-02 で S3 PUT 用の presigned URL を取得する。
 */
export function useCreateImageUploadUrlMutation() {
  return useTypedMutation<
    CreateImageUploadUrlVariables,
    CreateImageUploadUrlMutation,
    CreateImageUploadUrlData
  >((variables) => ({
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
