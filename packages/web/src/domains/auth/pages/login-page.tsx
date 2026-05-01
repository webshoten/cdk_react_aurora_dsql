import { useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/auth-context.tsx";
import { configureAmplifyAuth } from "@/app/auth/amplify-auth.ts";
import { resolveConfigError } from "@/app/config/runtime-config.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

/*
 * # ログインページ
 *
 * ## 目的
 * 認証入口として Amplify UI のログイン画面を提供する。
 *
 * ## 説明
 * 認証済みユーザーは `/` へ遷移し、未認証ユーザーには Authenticator を表示する。
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const configError = resolveConfigError();

  useEffect(() => {
    configureAmplifyAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="mx-auto max-w-xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>認証済みユーザーのみアプリにアクセスできます。</CardDescription>
        </CardHeader>
        <CardContent>
          {configError ? <p className="text-sm text-red-600">{configError}</p> : null}
          <div className="mt-4">
            <Authenticator hideSignUp />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
