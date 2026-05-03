interface AuthSignInFormProps {
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onUsernameChange: (value: string) => void;
  password: string;
  username: string;
}

/*
 * # サインイン入力フォーム
 *
 * ## 目的
 * 未認証状態での username/password 入力と送信を担当する。
 */
export function AuthSignInForm(props: AuthSignInFormProps) {
  const { onPasswordChange, onSubmit, onUsernameChange, password, username } = props;

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input
        className="w-full rounded border border-border px-3 py-2 text-sm"
        onChange={(event) => onUsernameChange(event.target.value)}
        placeholder="username"
        required
        value={username}
      />
      <input
        className="w-full rounded border border-border px-3 py-2 text-sm"
        onChange={(event) => onPasswordChange(event.target.value)}
        placeholder="password"
        required
        type="password"
        value={password}
      />
      <button className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground" type="submit">
        Sign In
      </button>
    </form>
  );
}
