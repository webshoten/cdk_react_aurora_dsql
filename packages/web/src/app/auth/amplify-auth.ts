import { Amplify } from "aws-amplify";
import { fetchAuthSession, getCurrentUser, signIn, signOut, confirmSignIn } from "aws-amplify/auth";
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

export async function readAccessToken(): Promise<string | null> {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  cachedAccessToken = token ?? null;
  return cachedAccessToken;
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export async function checkAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

export async function amplifySignIn(username: string, password: string): Promise<
  | { status: "authenticated" }
  | { status: "challenge"; challengeName: SignInChallenge }
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
  if (step === "CONFIRM_SIGN_IN_WITH_SMS_CODE" || step === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
    return {
      status: "challenge",
      challengeName: step,
    };
  }

  throw new Error(`Unsupported signIn step: ${step ?? "unknown"}`);
}

export async function amplifyConfirmSignIn(code: string): Promise<void> {
  const result = await confirmSignIn({ challengeResponse: code });
  if (result.nextStep?.signInStep !== "DONE") {
    throw new Error(`Unsupported confirmSignIn step: ${result.nextStep?.signInStep ?? "unknown"}`);
  }
}

export async function amplifySignOut(): Promise<void> {
  await signOut();
  cachedAccessToken = null;
}
