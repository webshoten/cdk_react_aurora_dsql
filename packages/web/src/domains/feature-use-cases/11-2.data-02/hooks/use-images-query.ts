import { useTypedQuery } from "@pf/graphql/urql";

/*
 * # 画像一覧 Query フック
 *
 * ## 目的
 * 11-2.data-02 のテーブル表示用に画像メタデータ一覧を取得する。
 */
export function useImagesQuery(pause: boolean) {
  return useTypedQuery({
    query: {
      images: {
        imageId: true,
        imagePath: true,
        fileName: true,
        contentType: true,
        sizeBytes: true,
        downloadUrl: true,
      },
    },
    pause,
  });
}
