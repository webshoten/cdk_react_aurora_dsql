import type { MfaType } from "@/domains/auth/lib/amplify-auth.ts";

interface AuthMfaSetupFormProps {
  mfaContact: string;
  mfaSetupCode: string;
  mfaSetupStarted: boolean;
  mfaType: MfaType;
  onMfaContactChange: (value: string) => void;
  onMfaSetupCodeChange: (value: string) => void;
  onMfaTypeChange: (value: MfaType) => void;
  onResend: () => void;
  onStartSubmit: () => void;
  onVerifySubmit: () => void;
}

/*
 * # MFA 設定フォーム
 *
 * ## 目的
 * mfa_setup 導線で手段選択・連絡先入力・確認コード確定を段階表示する。
 */
export function AuthMfaSetupForm(props: AuthMfaSetupFormProps) {
  const {
    mfaContact,
    mfaSetupCode,
    mfaSetupStarted,
    mfaType,
    onMfaContactChange,
    onMfaSetupCodeChange,
    onMfaTypeChange,
    onResend,
    onStartSubmit,
    onVerifySubmit,
  } = props;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm">MFA 設定が必要です。手段を選択して確認コードを送信してください。</p>
      {!mfaSetupStarted ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onStartSubmit();
          }}
        >
          <select
            className="w-full rounded border border-border px-3 py-2 text-sm"
            onChange={(event) => onMfaTypeChange(event.target.value as MfaType)}
            value={mfaType}
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
          </select>
          <input
            className="w-full rounded border border-border px-3 py-2 text-sm"
            onChange={(event) => onMfaContactChange(event.target.value)}
            placeholder={mfaType === "SMS" ? "+819012345678" : "user@example.com"}
            required
            value={mfaContact}
          />
          <button
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
            type="submit"
          >
            Send Verification Code
          </button>
        </form>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onVerifySubmit();
          }}
        >
          <p className="text-sm">確認コードを入力してください。届かない場合は再送できます。</p>
          <input
            className="w-full rounded border border-border px-3 py-2 text-sm"
            maxLength={6}
            onChange={(event) => onMfaSetupCodeChange(event.target.value)}
            placeholder="123456"
            required
            value={mfaSetupCode}
          />
          <button
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
            type="submit"
          >
            Complete MFA Setup
          </button>
          <button
            className="ml-2 rounded bg-secondary px-4 py-2 text-sm text-secondary-foreground"
            onClick={onResend}
            type="button"
          >
            Resend Code
          </button>
        </form>
      )}
    </div>
  );
}
