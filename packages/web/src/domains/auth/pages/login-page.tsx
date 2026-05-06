import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resolveConfigError } from "@/app/config/runtime-config.ts";
import { useAuth } from "@/domains/auth/context/auth-context.tsx";
import type { MfaType } from "@/domains/auth/lib/amplify-auth.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";
import { AuthMfaConfirmForm } from "../components/auth-mfa-confirm-form.tsx";
import { AuthMfaSetupForm } from "../components/auth-mfa-setup-form.tsx";
import { AuthNewPasswordForm } from "../components/auth-new-password-form.tsx";
import { AuthSignInForm } from "../components/auth-sign-in-form.tsx";

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
  const location = useLocation();
  const navigate = useNavigate();
  const {
    authState,
    completeMfaSetup,
    confirmMfa,
    confirmNewPassword,
    error,
    resendMfaVerificationCode,
    signIn,
    startMfaSetup,
  } = useAuth();
  const configError = resolveConfigError();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaType, setMfaType] = useState<MfaType>("EMAIL");
  const [mfaContact, setMfaContact] = useState("");
  const [mfaSetupCode, setMfaSetupCode] = useState("");
  const [mfaSetupStarted, setMfaSetupStarted] = useState(false);
  const locationState = location.state as { from?: unknown } | null;
  const redirectTo = typeof locationState?.from === "string" ? locationState.from : "/";

  //リロード時にそのまま対象画面にとどまる
  useEffect(() => {
    if (authState === "authenticated") navigate(redirectTo, { replace: true });
  }, [authState, navigate, redirectTo]);

  function renderAuthForm() {
    if (authState === "initializing") {
      return <p className="mt-4 text-sm">loading...</p>;
    }

    if (authState === "unauthenticated") {
      return (
        <AuthSignInForm
          onPasswordChange={setPassword}
          onSubmit={() => {
            void signIn(username, password);
          }}
          onUsernameChange={setUsername}
          password={password}
          username={username}
        />
      );
    }

    if (authState === "new_password_required") {
      return (
        <AuthNewPasswordForm
          newPassword={newPassword}
          onNewPasswordChange={setNewPassword}
          onSubmit={() => {
            void confirmNewPassword(newPassword);
          }}
        />
      );
    }

    if (authState === "mfa_required") {
      return (
        <AuthMfaConfirmForm
          mfaCode={mfaCode}
          onMfaCodeChange={setMfaCode}
          onResend={() => {
            void resendMfaVerificationCode();
          }}
          onSubmit={() => {
            void confirmMfa(mfaCode);
          }}
        />
      );
    }

    if (authState === "mfa_setup") {
      return (
        <AuthMfaSetupForm
          mfaContact={mfaContact}
          mfaSetupCode={mfaSetupCode}
          mfaSetupStarted={mfaSetupStarted}
          mfaType={mfaType}
          onMfaContactChange={setMfaContact}
          onMfaSetupCodeChange={setMfaSetupCode}
          onMfaTypeChange={setMfaType}
          onResend={() => {
            void startMfaSetup(mfaType, mfaContact);
          }}
          onStartSubmit={() => {
            void startMfaSetup(mfaType, mfaContact).then((started) => {
              if (started) setMfaSetupStarted(true);
            });
          }}
          onVerifySubmit={() => {
            void completeMfaSetup(mfaSetupCode);
          }}
        />
      );
    }

    return null;
  }

  return (
    <div className="mx-auto max-w-xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>認証済みユーザーのみアプリにアクセスできます。</CardDescription>
        </CardHeader>
        <CardContent>
          {configError ? <p className="text-sm text-red-600">{configError}</p> : null}
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          {renderAuthForm()}
        </CardContent>
      </Card>
    </div>
  );
}
