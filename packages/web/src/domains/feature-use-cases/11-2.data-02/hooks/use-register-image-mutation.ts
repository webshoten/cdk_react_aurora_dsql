import type { MutationResult } from "@pf/graphql/genql";
import { useTypedMutation } from "@pf/graphql/urql";

interface RegisterImageVariables {
  contentType: string;
  fileName: string;
  imagePath: string;
  sizeBytes: number;
}

type RegisterImageMutation = {
  registerImage: {
    __args: {
      contentType: string;
      fileName: string;
      imagePath: string;
      sizeBytes: number;
    };
    appliedCount: true;
  };
};

type RegisterImageData = MutationResult<RegisterImageMutation>;

/*
 * # 画像メタデータ登録 Mutation フック
 *
 * ## 目的
 * S3 保存済み画像の imagePath / メタデータを DB に登録する。
 */
export function useRegisterImageMutation() {
  return useTypedMutation<RegisterImageVariables, RegisterImageMutation, RegisterImageData>(
    (variables) => ({
      registerImage: {
        __args: {
          contentType: variables.contentType,
          fileName: variables.fileName,
          imagePath: variables.imagePath,
          sizeBytes: variables.sizeBytes,
        },
        appliedCount: true,
      },
    }),
  );
}
