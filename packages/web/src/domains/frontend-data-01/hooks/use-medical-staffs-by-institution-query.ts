import { useTypedQuery } from "@pf/graphql/urql";

/*
 * # 医療機関別スタッフ一覧 Query フック
 *
 * ## 目的
 * Data01Page から利用される、institutionCode 指定の medicalStaffsByInstitution Query を発行する画面用ラッパー。
 *
 * ## 説明
 * useTypedQuery（@pf/graphql/urql）の薄いラッパー。pause を受け、設定エラー時に発行を抑止できるようにする。
 */
export function useMedicalStaffsByInstitutionQuery(institutionCode: string, pause: boolean) {
  return useTypedQuery({
    query: {
      medicalStaffsByInstitution: {
        __args: { institutionCode },
        staffCode: true,
        institutionCode: true,
        name: true,
        profession: true,
      },
    },
    pause,
  });
}
