interface AuthNewPasswordFormProps {
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

/*
 * # 新パスワード入力フォーム
 *
 * ## 目的
 * NEW_PASSWORD_REQUIRED 導線で新しいパスワード入力と送信を担当する。
 */
export function AuthNewPasswordForm(props: AuthNewPasswordFormProps) {
  const { newPassword, onNewPasswordChange, onSubmit } = props;

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="text-sm">新しいパスワードを入力してください。</p>
      <input
        className="w-full rounded border border-border px-3 py-2 text-sm"
        onChange={(event) => onNewPasswordChange(event.target.value)}
        placeholder="new password"
        required
        type="password"
        value={newPassword}
      />
      <button className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground" type="submit">
        Confirm New Password
      </button>
    </form>
  );
}
