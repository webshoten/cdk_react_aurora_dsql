import SchemaBuilder from "@pothos/core";
import type { GraphqlContext } from "../context.ts";
import { resolveCreateImageUploadUrl, resolveImages, resolveRegisterImage } from "../resolvers/images.ts";
import {
  resolveAddRandomMedicalStaff,
  resolveClearMedicalStaffsByInstitution,
  resolveMedicalStaffsByInstitution,
  resolveSeedMedicalStaffs,
} from "../resolvers/medical-staffs.ts";
import { resolveSeedItems } from "../resolvers/seed.ts";
import { resolveCreateUser, resolveCurrentUser, resolveResetUserPassword, resolveSyncCurrentUserMfaPreference, resolveUsers } from "../resolvers/users.ts";

const builder = new SchemaBuilder<{
  Context: GraphqlContext;
}>({});

const SeedItemRef = builder.objectRef<{
  code: string;
  label: string;
}>("SeedItem");

const MedicalStaffRef = builder.objectRef<{
  institutionCode: string;
  name: string;
  profession: string;
  staffCode: string;
}>("MedicalStaff");

const UpsertMedicalStaffsPayloadRef = builder.objectRef<{
  appliedCount: number;
}>("UpsertMedicalStaffsPayload");

const ImageRef = builder.objectRef<{
  contentType: string;
  downloadUrl: string;
  fileName: string;
  imageId: string;
  imagePath: string;
  sizeBytes: number;
}>("Image");

const PresignedUploadPayloadRef = builder.objectRef<{
  imagePath: string;
  uploadUrl: string;
}>("PresignedUploadPayload");

const RegisterImagePayloadRef = builder.objectRef<{
  appliedCount: number;
}>("RegisterImagePayload");

const CurrentUserRef = builder.objectRef<{
  groups: string[];
  institutionCode?: string;
  userId: string;
  username: string;
}>("CurrentUser");

const UserRef = builder.objectRef<{
  createdAt: string;
  email: string;
  mfaPreference: string;
  uid: string;
  userType: string;
  username: string;
}>("User");

const CreateUserPayloadRef = builder.objectRef<{
  username: string;
}>("CreateUserPayload");

const ResetUserPasswordPayloadRef = builder.objectRef<{
  temporaryPassword: string;
  username: string;
}>("ResetUserPasswordPayload");

const SyncCurrentUserMfaPreferencePayloadRef = builder.objectRef<{
  synced: boolean;
}>("SyncCurrentUserMfaPreferencePayload");

SeedItemRef.implement({
  fields: (t) => ({
    code: t.exposeString("code", { description: "シード項目コード。" }),
    label: t.exposeString("label", { description: "シード項目ラベル。" }),
  }),
});

MedicalStaffRef.implement({
  fields: (t) => ({
    staffCode: t.exposeString("staffCode", { description: "スタッフコード。" }),
    institutionCode: t.exposeString("institutionCode", { description: "所属機関コード。" }),
    name: t.exposeString("name", { description: "スタッフ名。" }),
    profession: t.exposeString("profession", { description: "職種。" }),
  }),
});

UpsertMedicalStaffsPayloadRef.implement({
  fields: (t) => ({
    appliedCount: t.exposeInt("appliedCount", { description: "反映件数。" }),
  }),
});

ImageRef.implement({
  fields: (t) => ({
    imageId: t.exposeString("imageId", { description: "画像ID。" }),
    imagePath: t.exposeString("imagePath", { description: "S3 上の画像パス。" }),
    fileName: t.exposeString("fileName", { description: "元ファイル名。" }),
    contentType: t.exposeString("contentType", { description: "MIME type。" }),
    sizeBytes: t.exposeInt("sizeBytes", { description: "ファイルサイズ（byte）。" }),
    downloadUrl: t.exposeString("downloadUrl", { description: "署名付きダウンロードURL。" }),
  }),
});

PresignedUploadPayloadRef.implement({
  fields: (t) => ({
    imagePath: t.exposeString("imagePath", { description: "アップロード先画像パス。" }),
    uploadUrl: t.exposeString("uploadUrl", { description: "署名付きアップロードURL。" }),
  }),
});

RegisterImagePayloadRef.implement({
  fields: (t) => ({
    appliedCount: t.exposeInt("appliedCount", { description: "反映件数。" }),
  }),
});

CurrentUserRef.implement({
  fields: (t) => ({
    userId: t.exposeString("userId", { description: "認証ユーザーの一意ID（sub）。" }),
    username: t.exposeString("username", { description: "認証ユーザーのユーザー名。" }),
    groups: t.exposeStringList("groups", { description: "認証ユーザーに付与されたグループ一覧。" }),
    institutionCode: t.exposeString("institutionCode", {
      description: "認証ユーザーの所属機関コード。未設定時は null。",
      nullable: true,
    }),
  }),
});

UserRef.implement({
  fields: (t) => ({
    username: t.exposeString("username", { description: "ユーザー名。" }),
    email: t.exposeString("email", { description: "メールアドレス。" }),
    uid: t.exposeString("uid", { description: "Cognito sub を保持するユーザーID。" }),
    userType: t.exposeString("userType", { description: "ユーザー種別。" }),
    mfaPreference: t.exposeString("mfaPreference", { description: "MFA 設定（none/sms/email）。" }),
    createdAt: t.exposeString("createdAt", { description: "レコード作成日時（ISO8601）。" }),
  }),
});

CreateUserPayloadRef.implement({
  fields: (t) => ({
    username: t.exposeString("username", { description: "作成されたユーザー名。" }),
  }),
});

ResetUserPasswordPayloadRef.implement({
  fields: (t) => ({
    username: t.exposeString("username", { description: "再設定対象のユーザー名。" }),
    temporaryPassword: t.exposeString("temporaryPassword", { description: "再設定後の一時パスワード。" }),
  }),
});

SyncCurrentUserMfaPreferencePayloadRef.implement({
  fields: (t) => ({
    synced: t.exposeBoolean("synced", { description: "同期成功フラグ。" }),
  }),
});

builder.queryType({
  fields: (t) => ({
    currentUser: t.field({
      description: "認証済みユーザー情報を返す。未認証時は null。",
      type: CurrentUserRef,
      nullable: true,
      resolve: async (_root, _args, context) => resolveCurrentUser(context),
    }),
    users: t.field({
      description: "users テーブルの一覧を返す。",
      type: [UserRef],
      resolve: async (_root, _args, context) => resolveUsers(context),
    }),
    seedItems: t.field({
      description: "シード項目一覧を返す。",
      type: [SeedItemRef],
      resolve: async (_root, _args, context) => resolveSeedItems(context),
    }),
    medicalStaffsByInstitution: t.field({
      description: "指定機関のスタッフ一覧を返す。",
      type: [MedicalStaffRef],
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => resolveMedicalStaffsByInstitution(context, args),
    }),
    images: t.field({
      description: "画像メタデータ一覧を返し、各行に署名付きダウンロードURLを付与する。",
      type: [ImageRef],
      resolve: async (_root, _args, context) => resolveImages(context),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    seedMedicalStaffs: t.field({
      description: "デモ用スタッフデータを投入/更新する。",
      type: UpsertMedicalStaffsPayloadRef,
      resolve: async (_root, _args, context) => resolveSeedMedicalStaffs(context),
    }),
    addRandomMedicalStaff: t.field({
      description: "指定機関へランダムスタッフを1件追加する。",
      type: UpsertMedicalStaffsPayloadRef,
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => resolveAddRandomMedicalStaff(context, args),
    }),
    clearMedicalStaffsByInstitution: t.field({
      description: "指定機関のスタッフを全削除する。",
      type: UpsertMedicalStaffsPayloadRef,
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => resolveClearMedicalStaffsByInstitution(context, args),
    }),
    createImageUploadUrl: t.field({
      description: "画像アップロード用の署名付きURLを発行する。",
      type: PresignedUploadPayloadRef,
      args: {
        contentType: t.arg.string({ required: true }),
        fileName: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => resolveCreateImageUploadUrl(context, args),
    }),
    registerImage: t.field({
      description: "アップロード済み画像のメタデータを登録する。",
      type: RegisterImagePayloadRef,
      args: {
        contentType: t.arg.string({ required: true }),
        fileName: t.arg.string({ required: true }),
        imagePath: t.arg.string({ required: true }),
        sizeBytes: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, context) => resolveRegisterImage(context, args),
    }),
    createUser: t.field({
      description: "認証基盤と users テーブルへユーザーを作成する。",
      type: CreateUserPayloadRef,
      args: {
        username: t.arg.string({ required: true }),
        password: t.arg.string({ required: true }),
        email: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => resolveCreateUser(context, args),
    }),
    resetUserPassword: t.field({
      description: "ユーザーのパスワードを再設定し、一時パスワードを返す。",
      type: ResetUserPasswordPayloadRef,
      args: {
        username: t.arg.string({ required: true }),
      },
      resolve: async (_root, args) => resolveResetUserPassword(args),
    }),
    syncCurrentUserMfaPreference: t.field({
      description: "認証ユーザー自身の MFA 設定を users テーブルへ同期する。",
      type: SyncCurrentUserMfaPreferencePayloadRef,
      args: {
        mfaPreference: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) =>
        resolveSyncCurrentUserMfaPreference(context, {
          mfaPreference: args.mfaPreference as "none" | "sms" | "email",
        }),
    }),
  }),
});

/*
 * # GraphQL スキーマ定義
 *
 * ## 目的
 * Yoga サーバーに渡される GraphQL スキーマ本体。Pothos で型・Query・Mutation を組み立て最終的に GraphQLSchema を吐く。
 *
 * ## 説明
 * resolver は core の repository / use case 関数を直接呼び出す薄い層。
 * SeedItem / MedicalStaff / UpsertMedicalStaffsPayload の 3 型と、Query 2 件・Mutation 1 件で構成。
 */
export const schema = builder.toSchema();
