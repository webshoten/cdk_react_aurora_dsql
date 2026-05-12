interface DemoMedicalStaffInput {
  institutionCode: string;
  name: string;
  profession: string;
  staffCode: string;
}

/*
 * # 医療スタッフ デモデータ
 *
 * ## 目的
 * デモ用 GraphQL mutation（upsertDemoMedicalStaffs）が投入する固定 3 件レコード。
 *
 * ## 説明
 * institution_code が demo-hospital-1 / demo-hospital-2 にまたがる構成。
 * 配列長は 3 固定タプル。件数を検証ロジック側で参照するため変えると影響あり。
 */
export const DEMO_MEDICAL_STAFFS: [
  DemoMedicalStaffInput,
  DemoMedicalStaffInput,
  DemoMedicalStaffInput,
] = [
  {
    staffCode: "dr-sato",
    institutionCode: "demo-hospital-1",
    name: "Taro Sato",
    profession: "doctor",
  },
  {
    staffCode: "nr-suzuki",
    institutionCode: "demo-hospital-1",
    name: "Hanako Suzuki",
    profession: "nurse",
  },
  {
    staffCode: "ph-tanaka",
    institutionCode: "demo-hospital-2",
    name: "Ken Tanaka",
    profession: "pharmacist",
  },
];
