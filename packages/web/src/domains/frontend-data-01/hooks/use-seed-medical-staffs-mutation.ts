import { useTypedMutation } from "@pf/graphql/urql";

type SeedMedicalStaffsVariables = Record<string, never>;

/*
 * # デモスタッフ投入 Mutation フック
 *
 * ## 目的
 * Data01Page から利用される、seedMedicalStaffs Mutation 発行ラッパー。デモデータ投入ボタンの実体。
 *
 * ## 説明
 * 引数なし。レスポンスは appliedCount のみ取得。
 */
export function useSeedMedicalStaffsMutation() {
  return useTypedMutation((_: SeedMedicalStaffsVariables) => ({
    seedMedicalStaffs: {
      appliedCount: true,
    },
  }));
}
