-- Aurora DSQL では ALTER TABLE ADD COLUMN 時の制約同時追加（DEFAULT / NOT NULL）が非対応。
-- そのため本 migration は列追加のみを行い、制約付与は別 migration で対応可否を確認して扱う。
ALTER TABLE "users"
ADD COLUMN "mfa_preference" text;
