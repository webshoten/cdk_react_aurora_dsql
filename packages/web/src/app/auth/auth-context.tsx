import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { amplifySignOut, checkAuthenticated, configureAmplifyAuth, readAccessToken } from "@/app/auth/amplify-auth.ts";

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
  error: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    configureAmplifyAuth();
    void (async () => {
      const authenticated = await checkAuthenticated();
      setIsAuthenticated(authenticated);
      setAccessTokenState(authenticated ? await readAccessToken() : null);
    })();

    const unlisten = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") {
        setIsAuthenticated(true);
        void readAccessToken().then((token) => {
          setAccessTokenState(token);
        });
        setError(null);
      }

      if (payload.event === "signedOut") {
        setIsAuthenticated(false);
        setAccessTokenState(null);
      }
    });

    return () => {
      unlisten();
    };
  }, []);

  const value: AuthContextValue = {
    accessToken,
    error,
    isAuthenticated,
    logout: async () => {
      await amplifySignOut();
      setIsAuthenticated(false);
      setAccessTokenState(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");

  return context;
}
