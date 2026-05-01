/*
 * # 11-2 表示モデル型
 *
 * ## 目的
 * 画像一覧表示で使う行データ型を定義する。
 *
 * ## 説明
 * GraphQL 取得値の nullable を保持した UI 表示用の型として扱う。
 */
export interface ImageRow {
  imageId: string | null;
  imagePath: string | null;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  downloadUrl: string | null;
}
