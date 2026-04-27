import type { MutationResult } from "@pf/graphql/genql";
import { useTypedMutation } from "@pf/graphql/urql";

interface AddRandomMedicalStaffVariables {
  institutionCode: string;
}

type AddRandomMedicalStaffMutation = {
  addRandomMedicalStaff: {
    __args: {
      institutionCode: string;
    };
    appliedCount: true;
  };
};

type AddRandomMedicalStaffData = MutationResult<AddRandomMedicalStaffMutation>;

/*
 * # ランダム医療スタッフ追加 Mutation フック
 *
 * ## 目的
 * Data01Page から利用される、addRandomMedicalStaff Mutation 発行ラッパー。
 */
export function useAddRandomMedicalStaffMutation() {
  return useTypedMutation<
    AddRandomMedicalStaffVariables,
    AddRandomMedicalStaffMutation,
    AddRandomMedicalStaffData
  >((variables) => ({
    addRandomMedicalStaff: {
      __args: {
        institutionCode: variables.institutionCode,
      },
      appliedCount: true,
    },
  }));
}
