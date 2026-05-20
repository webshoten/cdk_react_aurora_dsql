import { useTypedMutation } from "@pf/graphql-schema/urql";

/*
 * # ランダム医療スタッフ追加 Mutation フック
 *
 * ## 目的
 * Data01Page から利用される、addRandomMedicalStaff Mutation 発行ラッパー。
 */
export function useAddRandomMedicalStaffMutation() {
  return useTypedMutation((variables: { institutionCode: string }) => ({
    addRandomMedicalStaff: {
      __args: {
        institutionCode: variables.institutionCode,
      },
      appliedCount: true,
    },
  }));
}
