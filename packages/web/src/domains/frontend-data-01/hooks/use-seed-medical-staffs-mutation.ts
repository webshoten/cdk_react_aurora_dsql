import { useMutation } from "urql";

type SeedMedicalStaffsData = {
  seedMedicalStaffs: {
    appliedCount: number;
  };
};

const SEED_MEDICAL_STAFFS_MUTATION = `
  mutation SeedMedicalStaffs {
    seedMedicalStaffs {
      appliedCount
    }
  }
`;

export function useSeedMedicalStaffsMutation() {
  return useMutation<SeedMedicalStaffsData>(SEED_MEDICAL_STAFFS_MUTATION);
}
