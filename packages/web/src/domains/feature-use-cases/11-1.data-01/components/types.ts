/*
 * # 11-1 表示モデル型
 *
 * ## 目的
 * 医療スタッフ一覧表示で使う行データ型を定義する。
 *
 * ## 説明
 * GraphQL 取得値の nullable を保持した UI 表示用の型として扱う。
 */
export interface MedicalStaffRow {
  staffCode: string | null;
  name: string | null;
  profession: string | null;
  institutionCode: string | null;
}
