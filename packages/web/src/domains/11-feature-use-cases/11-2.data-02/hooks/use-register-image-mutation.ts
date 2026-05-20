import { useTypedMutation } from "@pf/graphql-schema/urql";

/*
 * # 画像メタデータ登録 Mutation フック
 *
 * ## 目的
 * S3 保存済み画像の imagePath / メタデータを DB に登録する。
 */
export function useRegisterImageMutation() {
  return useTypedMutation(
    (variables: {
      contentType: string;
      fileName: string;
      imagePath: string;
      sizeBytes: number;
    }) => ({
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
