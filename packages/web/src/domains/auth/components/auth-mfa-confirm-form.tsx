interface AuthMfaConfirmFormProps {
  mfaCode: string;
  onMfaCodeChange: (value: string) => void;
  onResend: () => void;
  onSubmit: () => void;
}

/*
 * # MFA 確認コード入力フォーム
 *
 * ## 目的
 * mfa_required 導線で確認コード入力と送信を担当する。
 */
export function AuthMfaConfirmForm(props: AuthMfaConfirmFormProps) {
  const { mfaCode, onMfaCodeChange, onResend, onSubmit } = props;

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="text-sm">確認コードを入力してください。</p>
      <input
        className="w-full rounded border border-border px-3 py-2 text-sm"
        maxLength={6}
        onChange={(event) => onMfaCodeChange(event.target.value)}
        placeholder="123456"
        required
        value={mfaCode}
      />
      <button className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground" type="submit">
        Confirm MFA
      </button>
      <button className="ml-2 rounded bg-secondary px-4 py-2 text-sm" onClick={onResend} type="button">
        Resend Code
      </button>
    </form>
  );
}
