import { Amplify } from "aws-amplify";
import {
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
  confirmSignIn,
  fetchMFAPreference,
  updateUserAttributes,
  sendUserAttributeVerificationCode,
  confirmUserAttribute,
  updateMFAPreference,
} from "aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";
import { resolveAuthConfig } from "@/app/config/runtime-config.ts";

/*
 * # Amplify 認証ユーティリティ
 *
 * ## 目的
 * フロントエンドの認証処理を Amplify Auth 経由で統一する。
 *
 * ## 説明
 * 設定初期化、サインイン/サインアウト、トークン取得を集約し、呼び出し側を薄く保つ。
 */
let configured = false;
let cachedAccessToken: string | null = null;

export type SignInChallenge = "CONFIRM_SIGN_IN_WITH_SMS_CODE" | "CONFIRM_SIGN_IN_WITH_EMAIL_CODE";
export type SignInStep = SignInChallenge | "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED";
export type MfaType = "SMS" | "EMAIL";
export type MfaPreference = "none" | "sms" | "email";
export type AuthState =
  | "initializing"
  | "unauthenticated"
  | "new_password_required"
  | "mfa_setup"
  | "mfa_required"
  | "authenticated";

/*
 * # Amplify 認証初期化
 *
 * ## 目的
 * runtime config の Cognito 設定を 1 回だけ適用し、認証APIを利用可能にする。
 */
export function configureAmplifyAuth(): void {
  if (configured) return;
  const config = resolveAuthConfig();
  if (!config) return;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
        loginWith: {
          username: true,
          email: true,
        },
      },
    },
  });
  cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

  configured = true;
}

/*
 * # アクセストークン取得
 *
 * ## 目的
 * 現在セッションの access token を取得し、API ヘッダー付与用キャッシュを更新する。
 */
export async function readAccessToken(): Promise<string | null> {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  cachedAccessToken = token ?? null;
  return cachedAccessToken;
}

/*
 * # キャッシュ済みトークン参照
 *
 * ## 目的
 * 直近取得した access token を非同期呼び出しなしで参照する。
 */
export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

/*
 * # 認証済み判定
 *
 * ## 目的
 * 現在ユーザーが Cognito セッションを保持しているかを判定する。
 */
export async function checkAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/*
 * # MFA 設定状態取得
 *
 * ## 目的
 * Cognito の MFA 設定有無を読み取り、画面遷移用の最小状態へ正規化する。
 */
export async function readMfaPreference(): Promise<MfaPreference> {
  const preference = await fetchMFAPreference();
  const enabled = preference.enabled ?? [];
  if (enabled.length === 0) return "none";

  if (enabled.includes("SMS")) return "sms";
  if (enabled.includes("EMAIL")) return "email";
  return "none";
}

/*
 * # サインイン実行
 *
 * ## 目的
 * USER_PASSWORD_AUTH でサインインし、認証完了か確認コードチャレンジかを呼び出し側へ返す。
 */
export async function amplifySignIn(username: string, password: string): Promise<
  | { status: "authenticated" }
  | { status: "challenge"; step: SignInStep }
> {
  const result = await signIn({
    username,
    password,
    options: {
      authFlowType: "USER_PASSWORD_AUTH",
    },
  });

  const step = result.nextStep?.signInStep;
  if (step === "DONE") return { status: "authenticated" };
  if (
    step === "CONFIRM_SIGN_IN_WITH_SMS_CODE" ||
    step === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE" ||
    step === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
  ) {
    return {
      status: "challenge",
      step,
    };
  }

  throw new Error(`Unsupported signIn step: ${step ?? "unknown"}`);
}

/*
 * # サインインチャレンジ確定
 *
 * ## 目的
 * 受け取った確認コードで confirmSignIn を完了し、認証完了（DONE）まで進める。
 */
export async function amplifyConfirmSignIn(code: string): Promise<void> {
  const result = await confirmSignIn({ challengeResponse: code });
  if (result.nextStep?.signInStep !== "DONE") {
    throw new Error(`Unsupported confirmSignIn step: ${result.nextStep?.signInStep ?? "unknown"}`);
  }
}

/*
 * # 新パスワード確定
 *
 * ## 目的
 * NEW_PASSWORD_REQUIRED チャレンジで入力した新パスワードを確定し、次のサインイン段階を返す。
 */
export async function amplifyConfirmNewPassword(newPassword: string): Promise<
  | { status: "authenticated" }
  | { status: "challenge"; step: SignInChallenge }
> {
  const result = await confirmSignIn({ challengeResponse: newPassword });
  const step = result.nextStep?.signInStep;
  if (step === "DONE") return { status: "authenticated" };
  if (step === "CONFIRM_SIGN_IN_WITH_SMS_CODE" || step === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
    return { status: "challenge", step };
  }

  throw new Error(`Unsupported confirmSignIn(new password) step: ${step ?? "unknown"}`);
}

/*
 * # MFA 設定開始
 *
 * ## 目的
 * MFA 設定導線で連絡先属性を更新し、確認コード送信を開始する。
 */
export async function amplifyStartMfaSetup(type: MfaType, contact: string): Promise<void> {
  if (type === "SMS") {
    await updateUserAttributes({
      userAttributes: {
        phone_number: contact,
      },
    });
    await sendUserAttributeVerificationCode({ userAttributeKey: "phone_number" });
    return;
  }

  await updateUserAttributes({
    userAttributes: {
      email: contact,
    },
  });
  await sendUserAttributeVerificationCode({ userAttributeKey: "email" });
}

/*
 * # MFA 設定確定
 *
 * ## 目的
 * 受信した確認コードを検証し、MFA 優先手段を確定する。
 */
export async function amplifyCompleteMfaSetup(type: MfaType, code: string): Promise<void> {
  if (type === "SMS") {
    await confirmUserAttribute({
      userAttributeKey: "phone_number",
      confirmationCode: code,
    });
    await updateMFAPreference({
      sms: "PREFERRED",
      email: "DISABLED",
      totp: "DISABLED",
    });
    return;
  }

  await confirmUserAttribute({
    userAttributeKey: "email",
    confirmationCode: code,
  });
  await updateMFAPreference({
    sms: "DISABLED",
    email: "PREFERRED",
    totp: "DISABLED",
  });
}

/*
 * # サインアウト
 *
 * ## 目的
 * Cognito セッションを破棄し、ローカルのトークンキャッシュを無効化する。
 */
export async function amplifySignOut(): Promise<void> {
  await signOut();
  cachedAccessToken = null;
}
