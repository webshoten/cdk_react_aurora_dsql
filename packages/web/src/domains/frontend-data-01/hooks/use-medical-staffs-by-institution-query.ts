import { useQuery } from "urql";

type MedicalStaff = {
  institutionCode: string;
  name: string;
  profession: string;
  staffCode: string;
};

type MedicalStaffsByInstitutionData = {
  medicalStaffsByInstitution: MedicalStaff[];
};

type MedicalStaffsByInstitutionVariables = {
  institutionCode: string;
};

const MEDICAL_STAFFS_BY_INSTITUTION_QUERY = `
  query MedicalStaffsByInstitution($institutionCode: String!) {
    medicalStaffsByInstitution(institutionCode: $institutionCode) {
      staffCode
      institutionCode
      name
      profession
    }
  }
`;

export function useMedicalStaffsByInstitutionQuery(institutionCode: string, pause: boolean) {
  return useQuery<MedicalStaffsByInstitutionData, MedicalStaffsByInstitutionVariables>({
    query: MEDICAL_STAFFS_BY_INSTITUTION_QUERY,
    variables: { institutionCode },
    pause,
  });
}
