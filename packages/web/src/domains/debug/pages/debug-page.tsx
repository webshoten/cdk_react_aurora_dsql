import { useMemo } from "react";
import { useMutation, useQuery } from "urql";
import { useAuth } from "@/app/auth/auth-context.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

/*
 * # Debug ページ
 *
 * ## 目的
 * 認証状態と運用補助操作（ユーザー作成/再設定）を検証する。
 *
 * ## 説明
 * トークン/claims 表示、GraphQL 経由の users 操作、トークンコピーを提供する。
 */
function readClaimsFromToken(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  const payload = parts[1];
  if (!payload) return null;

  try {
    const decoded = JSON.parse(atob(payload));
    return decoded as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function DebugPage() {
  const { accessToken, logout } = useAuth();
  const claims = useMemo(() => (accessToken ? readClaimsFromToken(accessToken) : null), [accessToken]);
  const [usersResult, refetchUsers] = useQuery({
    query: `query DebugUsers { users { uid username email userType createdAt } currentUser { userId username groups institutionCode } }`,
  });
  const [, createUser] = useMutation(`
    mutation DebugCreateUser($username: String!, $password: String!, $email: String!) {
      createUser(username: $username, password: $password, email: $email) { username }
    }
  `);
  const [, resetUserPassword] = useMutation(`
    mutation DebugResetUserPassword($username: String!) {
      resetUserPassword(username: $username) { username temporaryPassword }
    }
  `);

  async function handleCreateUser(formData: FormData) {
    const username = String(formData.get("username") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    if (!username || !email || !password) return;
    await createUser({ username, email, password });
    refetchUsers({ requestPolicy: "network-only" });
  }

  async function handleResetPassword(username: string): Promise<string | null> {
    const result = await resetUserPassword({ username });
    return result.data?.resetUserPassword?.temporaryPassword ?? null;
  }

  async function handleCopyAccessToken(): Promise<void> {
    if (!accessToken) return;
    await navigator.clipboard.writeText(accessToken);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug</CardTitle>
        <CardDescription>認証トークンと claim を確認するページです。</CardDescription>
      </CardHeader>
      <CardContent>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={logout} type="button">
          Logout
        </button>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Access Token</p>
            <button
              className="rounded bg-secondary px-2 py-1 text-xs"
              disabled={!accessToken}
              onClick={() => {
                void handleCopyAccessToken();
              }}
              type="button"
            >
              Copy
            </button>
          </div>
          <pre className="overflow-x-auto rounded-md border border-border p-3 text-xs">{accessToken ?? "(none)"}</pre>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Claims</p>
          <pre className="overflow-x-auto rounded-md border border-border p-3 text-xs">{JSON.stringify(claims, null, 2)}</pre>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">Create User</p>
          <form
            className="mt-2 grid gap-2 md:grid-cols-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleCreateUser(new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <input className="rounded border border-border px-2 py-1 text-sm" name="username" placeholder="username" required />
            <input className="rounded border border-border px-2 py-1 text-sm" name="email" placeholder="email" required type="email" />
            <input className="rounded border border-border px-2 py-1 text-sm" name="password" placeholder="password" required />
            <button className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground" type="submit">
              Create
            </button>
          </form>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">Users</p>
          <div className="mt-2 overflow-x-auto rounded border border-border">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-muted/40 text-left">
                  <th className="px-2 py-1">username</th>
                  <th className="px-2 py-1">email</th>
                  <th className="px-2 py-1">uid</th>
                  <th className="px-2 py-1">userType</th>
                  <th className="px-2 py-1">createdAt</th>
                  <th className="px-2 py-1">action</th>
                </tr>
              </thead>
              <tbody>
                {(usersResult.data?.users ?? []).map((user: { uid: string; email: string; userType: string; createdAt: string; username: string }) => (
                  <tr className="border-t border-border" key={user.username}>
                    <td className="px-2 py-1">{user.username}</td>
                    <td className="px-2 py-1">{user.email}</td>
                    <td className="px-2 py-1">{user.uid}</td>
                    <td className="px-2 py-1">{user.userType}</td>
                    <td className="px-2 py-1">{user.createdAt}</td>
                    <td className="px-2 py-1">
                      <button
                        className="rounded bg-secondary px-2 py-1"
                        onClick={async () => {
                          const temp = await handleResetPassword(user.username);
                          if (temp) window.alert(`temporary password: ${temp}`);
                        }}
                        type="button"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
