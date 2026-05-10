-- Aurora DSQL では ALTER TABLE ADD COLUMN 時の制約同時追加（DEFAULT / NOT NULL）が非対応。
-- 所属未設定の既存ユーザーを許容するため、まず nullable column として追加する。
ALTER TABLE "users"
ADD COLUMN "medical_institution_id" text;
