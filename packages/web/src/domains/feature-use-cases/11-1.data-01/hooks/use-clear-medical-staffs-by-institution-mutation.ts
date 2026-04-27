import type { MutationResult } from "@pf/graphql/genql";
import { useTypedMutation } from "@pf/graphql/urql";

interface ClearMedicalStaffsByInstitutionVariables {
  institutionCode: string;
}

type ClearMedicalStaffsByInstitutionMutation = {
  clearMedicalStaffsByInstitution: {
    __args: {
      institutionCode: string;
    };
    appliedCount: true;
  };
};

type ClearMedicalStaffsByInstitutionData = MutationResult<ClearMedicalStaffsByInstitutionMutation>;

/*
 * # 医療スタッフ全削除 Mutation フック
 *
 * ## 目的
 * Data01Page から利用される、clearMedicalStaffsByInstitution Mutation 発行ラッパー。
 */
export function useClearMedicalStaffsByInstitutionMutation() {
  return useTypedMutation<
    ClearMedicalStaffsByInstitutionVariables,
    ClearMedicalStaffsByInstitutionMutation,
    ClearMedicalStaffsByInstitutionData
  >((variables) => ({
    clearMedicalStaffsByInstitution: {
      __args: {
        institutionCode: variables.institutionCode,
      },
      appliedCount: true,
    },
  }));
}
