import { Hub } from "aws-amplify/utils";
import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { resolveGraphqlUrl } from "@/app/config/runtime-config.ts";
import {
  type AuthState,
  amplifyCompleteMfaSetup,
  amplifyConfirmNewPassword,
  amplifyConfirmSignIn,
  amplifySignIn,
  amplifySignOut,
  amplifyStartMfaSetup,
  checkAuthenticated,
  configureAmplifyAuth,
  type MfaPreference,
  type MfaType,
  readAccessToken,
  readMfaPreference,
} from "@/domains/auth/lib/amplify-auth.ts";

/*
 * # 認証コンテキスト
 *
 * ## 目的
 * アプリ全体で認証状態とトークンを共有する。
 *
 * ## 説明
 * Amplify の auth イベントを購読し、サインイン/サインアウト時に状態を同期する。
 */
interface AuthContextValue {
  accessToken: string | null;
  authState: AuthState;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  confirmMfa: (code: string) => Promise<void>;
  resendMfaVerificationCode: () => Promise<void>;
  confirmNewPassword: (newPassword: string) => Promise<void>;
  startMfaSetup: (type: MfaType, contact: string) => Promise<boolean>;
  completeMfaSetup: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>("initializing");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingMfaType, setPendingMfaType] = useState<MfaType | null>(null);
  const [pendingLoginUsername, setPendingLoginUsername] = useState<string | null>(null);
  const [pendingLoginPassword, setPendingLoginPassword] = useState<string | null>(null);

  const resetToUnauthenticatedState = useCallback((): void => {
    setIsAuthenticated(false);
    setAccessTokenState(null);
    setAuthState("unauthenticated");
    setPendingMfaType(null);
    setPendingLoginUsername(null);
    setPendingLoginPassword(null);
  }, []);

  const syncMfaPreferenceToUsersTable = useCallback(
    async (preference: MfaPreference): Promise<void> => {
      const token = await readAccessToken();
      const graphqlUrl = resolveGraphqlUrl();
      if (!token || !graphqlUrl) return;

      await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query:
            "mutation SyncCurrentUserMfaPreference($mfaPreference: String!) { syncCurrentUserMfaPreference(mfaPreference: $mfaPreference) { synced } }",
          variables: {
            mfaPreference: preference,
          },
        }),
      });
    },
    [],
  );

  useEffect(() => {
    async function syncAuthenticatedStateByMfaPreference(): Promise<void> {
      try {
        const mfaPreference = await readMfaPreference();
        setIsAuthenticated(mfaPreference !== "none");
        setAccessTokenState(await readAccessToken());
        setAuthState(mfaPreference !== "none" ? "authenticated" : "mfa_setup");
        await syncMfaPreferenceToUsersTable(mfaPreference);
      } catch {
        // 失効済みトークンで MFA 取得に失敗した場合は、起動を止めず未認証へ戻す。
        resetToUnauthenticatedState();
      }
    }

    configureAmplifyAuth();
    void (async () => {
      // 起動時はセッション有無を先に判定し、未認証なら即 unauthenticated へ遷移する。
      const authenticated = await checkAuthenticated();
      if (!authenticated) {
        resetToUnauthenticatedState();
        return;
      }

      // 認証済みの場合、MFA 設定済みなら authenticated、未設定なら mfa_setup へ遷移する。
      await syncAuthenticatedStateByMfaPreference();
    })();

    // Amplify Auth が認証イベント（signedIn / signedOut）を発行したタイミングで呼ばれる。
    const unlisten = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") {
        void (async () => {
          // サインイン直後も、MFA 設定済みなら authenticated、未設定なら mfa_setup へ遷移する。
          await syncAuthenticatedStateByMfaPreference();
        })();
        setError(null);
      }

      if (payload.event === "signedOut") {
        // 認証情報が失効したら常に未認証状態へ戻す。
        resetToUnauthenticatedState();
      }
    });

    return () => {
      // アンマウント時に auth イベントリスナーを解除する。
      unlisten();
    };
  }, [resetToUnauthenticatedState, syncMfaPreferenceToUsersTable]);

  const value: AuthContextValue = {
    accessToken,
    authState,
    error,
    isAuthenticated,
    signIn: async (username: string, password: string) => {
      try {
        const result = await amplifySignIn(username, password);
        if (result.status === "authenticated") {
          const mfaPreference = await readMfaPreference();
          setIsAuthenticated(mfaPreference !== "none");
          setAccessTokenState(await readAccessToken());
          setAuthState(mfaPreference !== "none" ? "authenticated" : "mfa_setup");
          await syncMfaPreferenceToUsersTable(mfaPreference);
          setError(null);
          return;
        }

        if (result.step === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
          setAuthState("new_password_required");
          setPendingLoginUsername(username);
          setPendingLoginPassword(password);
          setError(null);
          return;
        }

        setAuthState("mfa_required");
        setPendingLoginUsername(username);
        setPendingLoginPassword(password);
        setError(null);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "signIn failed";
        setError(message);
      }
    },
    confirmMfa: async (code: string) => {
      try {
        await amplifyConfirmSignIn(code);
        const mfaPreference = await readMfaPreference();
        setIsAuthenticated(mfaPreference !== "none");
        setAccessTokenState(await readAccessToken());
        setAuthState(mfaPreference !== "none" ? "authenticated" : "mfa_setup");
        await syncMfaPreferenceToUsersTable(mfaPreference);
        setError(null);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "confirmMfa failed";
        setError(message);
      }
    },
    resendMfaVerificationCode: async () => {
      if (!pendingLoginUsername || !pendingLoginPassword) {
        setError("再送に必要なサインイン情報がありません");
        return;
      }
      try {
        await amplifySignIn(pendingLoginUsername, pendingLoginPassword);
        setError(null);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "resendMfaVerificationCode failed";
        setError(message);
      }
    },
    confirmNewPassword: async (newPassword: string) => {
      try {
        const result = await amplifyConfirmNewPassword(newPassword);
        if (result.status === "authenticated") {
          const mfaPreference = await readMfaPreference();
          setIsAuthenticated(mfaPreference !== "none");
          setAccessTokenState(await readAccessToken());
          setAuthState(mfaPreference !== "none" ? "authenticated" : "mfa_setup");
          await syncMfaPreferenceToUsersTable(mfaPreference);
          setError(null);
          return;
        }

        setAuthState("mfa_required");
        setError(null);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "confirmNewPassword failed";
        setError(message);
      }
    },
    startMfaSetup: async (type: MfaType, contact: string) => {
      try {
        await amplifyStartMfaSetup(type, contact);
        setPendingMfaType(type);
        setError(null);
        return true;
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "startMfaSetup failed";
        setError(message);
        return false;
      }
    },
    completeMfaSetup: async (code: string) => {
      if (!pendingMfaType) {
        setError("MFA 手段が未選択です");
        return;
      }
      try {
        await amplifyCompleteMfaSetup(pendingMfaType, code);
        const mfaPreference = await readMfaPreference();
        setIsAuthenticated(mfaPreference !== "none");
        setAccessTokenState(await readAccessToken());
        setAuthState(mfaPreference !== "none" ? "authenticated" : "mfa_setup");
        await syncMfaPreferenceToUsersTable(mfaPreference);
        setPendingMfaType(null);
        setError(null);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "completeMfaSetup failed";
        setError(message);
      }
    },
    logout: async () => {
      await amplifySignOut();
      // 明示ログアウトでも signedOut 時と同じ最終状態へ揃える。
      setIsAuthenticated(false);
      setAccessTokenState(null);
      setAuthState("unauthenticated");
      setPendingMfaType(null);
      setPendingLoginUsername(null);
      setPendingLoginPassword(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");

  return context;
}
