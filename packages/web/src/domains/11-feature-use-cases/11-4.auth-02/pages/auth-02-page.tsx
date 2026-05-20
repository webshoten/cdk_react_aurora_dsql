import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

/*
 * # 11-4.auth-02 ページ（状態遷移表示）
 *
 * ## 目的
 * auth-02 の認証状態遷移を画面上で確認できるようにし、検証時の判定観点を固定する。
 */
export function Auth02Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>11-4.auth-02 Authentication Specification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <section>
          <p className="font-medium">検証仕様（auth-02）</p>
          <ul className="list-disc pl-6">
            <li>MFA強制導線: 毎回ログイン時に確認コードを要求する</li>
            <li>初回/仮パスワード導線: 仮パスワード利用時に新PW設定を必須にする</li>
            <li>MFAセットアップ導線: MFA未設定ユーザーを設定フローへ誘導する</li>
            <li>MFAコード再送: MFA認証時とMFA設定時の両方で再送できる</li>
            <li>
              認証状態管理: 判定源はCognito応答、永続は
              users.mfaPreference、画面遷移はフロント一時状態で管理する
            </li>
          </ul>
        </section>

        <section>
          <p className="font-medium">起動・サインイン遷移</p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-2 py-1">現在状態</th>
                <th className="px-2 py-1">条件</th>
                <th className="px-2 py-1">次状態</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-2 py-1">初期化中</td>
                <td className="px-2 py-1">セッションなし</td>
                <td className="px-2 py-1">未認証</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">初期化中</td>
                <td className="px-2 py-1">セッションあり + MFA設定済み</td>
                <td className="px-2 py-1">認証済み</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">初期化中</td>
                <td className="px-2 py-1">セッションあり + MFA未設定</td>
                <td className="px-2 py-1">MFA設定待ち</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">未認証</td>
                <td className="px-2 py-1">ログイン成功 + MFA設定済み</td>
                <td className="px-2 py-1">認証済み</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">未認証</td>
                <td className="px-2 py-1">ログイン成功 + MFA未設定</td>
                <td className="px-2 py-1">MFA設定待ち</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">未認証</td>
                <td className="px-2 py-1">仮パスワード更新が必要</td>
                <td className="px-2 py-1">新PW設定待ち</td>
              </tr>
              <tr>
                <td className="px-2 py-1">未認証</td>
                <td className="px-2 py-1">確認コード入力が必要</td>
                <td className="px-2 py-1">MFA認証待ち</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <p className="font-medium">新パスワード・MFA認証遷移</p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-2 py-1">現在状態</th>
                <th className="px-2 py-1">条件</th>
                <th className="px-2 py-1">次状態</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-2 py-1">新PW設定待ち</td>
                <td className="px-2 py-1">新PW確定 + MFA設定済み</td>
                <td className="px-2 py-1">認証済み</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">新PW設定待ち</td>
                <td className="px-2 py-1">新PW確定 + MFA未設定</td>
                <td className="px-2 py-1">MFA設定待ち</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">新PW設定待ち</td>
                <td className="px-2 py-1">新PW確定後に確認コード要求</td>
                <td className="px-2 py-1">MFA認証待ち</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">MFA認証待ち</td>
                <td className="px-2 py-1">確認コード成功 + MFA設定済み</td>
                <td className="px-2 py-1">認証済み</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">MFA認証待ち</td>
                <td className="px-2 py-1">確認コード成功 + MFA未設定</td>
                <td className="px-2 py-1">MFA設定待ち</td>
              </tr>
              <tr>
                <td className="px-2 py-1">MFA認証待ち</td>
                <td className="px-2 py-1">コード再送</td>
                <td className="px-2 py-1">MFA認証待ち</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <p className="font-medium">MFAセットアップ・サインアウト遷移</p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-2 py-1">現在状態</th>
                <th className="px-2 py-1">条件</th>
                <th className="px-2 py-1">次状態</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-2 py-1">MFA設定待ち</td>
                <td className="px-2 py-1">手段選択 / コード送信 / 再送</td>
                <td className="px-2 py-1">MFA設定待ち</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1">MFA設定待ち</td>
                <td className="px-2 py-1">MFA設定完了</td>
                <td className="px-2 py-1">認証済み</td>
              </tr>
              <tr>
                <td className="px-2 py-1">認証済み</td>
                <td className="px-2 py-1">ログアウト / セッション失効</td>
                <td className="px-2 py-1">未認証</td>
              </tr>
            </tbody>
          </table>
        </section>
      </CardContent>
    </Card>
  );
}
