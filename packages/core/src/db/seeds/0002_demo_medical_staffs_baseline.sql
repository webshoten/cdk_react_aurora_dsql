INSERT INTO medical_staffs (staff_code, institution_code, name, profession)
VALUES
  ('dr-sato', 'demo-hospital-1', 'Taro Sato', 'doctor'),
  ('nr-suzuki', 'demo-hospital-1', 'Hanako Suzuki', 'nurse'),
  ('ph-tanaka', 'demo-hospital-2', 'Ken Tanaka', 'pharmacist')
ON CONFLICT (staff_code) DO UPDATE
SET
  institution_code = EXCLUDED.institution_code,
  name = EXCLUDED.name,
  profession = EXCLUDED.profession,
  updated_at = NOW();
