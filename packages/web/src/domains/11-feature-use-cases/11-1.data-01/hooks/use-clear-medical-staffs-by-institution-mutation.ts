import { useTypedMutation } from "@pf/graphql-schema/urql";

/*
 * # 医療スタッフ全削除 Mutation フック
 *
 * ## 目的
 * Data01Page から利用される、clearMedicalStaffsByInstitution Mutation 発行ラッパー。
 */
export function useClearMedicalStaffsByInstitutionMutation() {
  return useTypedMutation((variables: { institutionCode: string }) => ({
    clearMedicalStaffsByInstitution: {
      __args: {
        institutionCode: variables.institutionCode,
      },
      appliedCount: true,
    },
  }));
}
