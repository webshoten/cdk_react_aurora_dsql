import type { AppSchemaBuilder } from "@functions/domains/graphql/schema/types.ts";
import {
  resolveCreateUser,
  resolveCurrentUser,
  resolveResetUserPassword,
  resolveSyncCurrentUserMfaPreference,
  resolveUsers,
} from "@functions/domains/users/resolver.ts";

export function registerUsersSchema(builder: AppSchemaBuilder): void {
  const CurrentUserRef = builder.objectRef<{
    groups: string[];
    institutionCode?: string;
    userId: string;
    username: string;
  }>("CurrentUser");
  const UserRef = builder.objectRef<{
    createdAt: string;
    email: string;
    medicalInstitutionId: string | null;
    mfaPreference: string;
    uid: string;
    userType: string;
    username: string;
  }>("User");
  const CreateUserPayloadRef = builder.objectRef<{ username: string }>("CreateUserPayload");
  const ResetUserPasswordPayloadRef = builder.objectRef<{
    temporaryPassword: string;
    username: string;
  }>("ResetUserPasswordPayload");
  const SyncCurrentUserMfaPreferencePayloadRef = builder.objectRef<{ synced: boolean }>(
    "SyncCurrentUserMfaPreferencePayload",
  );

  CurrentUserRef.implement({
    fields: (t) => ({
      userId: t.exposeString("userId", { description: "認証ユーザーの一意ID（sub）。" }),
      username: t.exposeString("username", { description: "認証ユーザーのユーザー名。" }),
      groups: t.exposeStringList("groups", {
        description: "認証ユーザーに付与されたグループ一覧。",
      }),
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
      medicalInstitutionId: t.exposeString("medicalInstitutionId", {
        description: "所属医療機関 ID。未設定時は null。",
        nullable: true,
      }),
      mfaPreference: t.exposeString("mfaPreference", {
        description: "MFA 設定（none/sms/email）。",
      }),
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
      temporaryPassword: t.exposeString("temporaryPassword", {
        description: "再設定後の一時パスワード。",
      }),
    }),
  });

  SyncCurrentUserMfaPreferencePayloadRef.implement({
    fields: (t) => ({
      synced: t.exposeBoolean("synced", { description: "同期成功フラグ。" }),
    }),
  });

  builder.queryField("currentUser", (t) =>
    t.field({
      description: "認証済みユーザー情報を返す。未認証時は null。",
      type: CurrentUserRef,
      nullable: true,
      resolve: async (_root, _args, context) => resolveCurrentUser(context),
    }),
  );

  builder.queryField("users", (t) =>
    t.field({
      description: "users テーブルの一覧を返す。",
      type: [UserRef],
      resolve: async (_root, _args, context) => resolveUsers(context),
    }),
  );

  builder.mutationField("createUser", (t) =>
    t.field({
      description: "認証基盤と users テーブルへユーザーを作成する。",
      type: CreateUserPayloadRef,
      args: {
        username: t.arg.string({ required: true }),
        password: t.arg.string({ required: true }),
        email: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => resolveCreateUser(context, args),
    }),
  );

  builder.mutationField("resetUserPassword", (t) =>
    t.field({
      description: "ユーザーのパスワードを再設定し、一時パスワードを返す。",
      type: ResetUserPasswordPayloadRef,
      args: {
        username: t.arg.string({ required: true }),
      },
      resolve: async (_root, args) => resolveResetUserPassword(args),
    }),
  );

  builder.mutationField("syncCurrentUserMfaPreference", (t) =>
    t.field({
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
  );
}
