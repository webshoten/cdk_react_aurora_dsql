interface DemoMedicalStaffInput {
  institutionCode: string;
  name: string;
  profession: string;
  staffCode: string;
}

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
