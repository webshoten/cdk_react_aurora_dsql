import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

/*
 * # 11-3.auth-01 ページ（仕様表示）
 *
 * ## 目的
 * Cognito 認証仕様を画面上で確認できるようにし、認証導線の検証観点を明示する。
 */
export function Auth01Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>11-3.auth-01 Cognito Specification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <section>
          <p className="font-medium">Cognito認証基盤: Webアプリの認証・認可を成立させる土台</p>
          <ul className="list-disc pl-6">
            <li>`UserPool / Web Client / IdentityPool` で構成する</li>
            <li>Web Client は SPA 前提で secret なし運用（公開クライアント）</li>
            <li>`USER_SRP_AUTH / USER_PASSWORD_AUTH / REFRESH_TOKEN_AUTH` を有効化する</li>
            <li>IdentityPool は `authenticated only`（未認証ゲストなし）にする</li>
          </ul>
        </section>

        <section>
          <p className="font-medium">GraphQL認可: 未認証リクエストをAPI入口で遮断する</p>
          <ul className="list-disc pl-6">
            <li>`/graphql` は Lambda Authorizer 経由で受ける</li>
            <li>未認証は API Gateway で拒否する</li>
            <li>resolver へ渡す認証情報は `userId / username / groups / institutionCode?` に限定する</li>
            <li>認証確認 Query は `currentUser` に統一する</li>
          </ul>
        </section>

        <section>
          <p className="font-medium">トークン拡張・認証制御ポイント: 要件追加に備えた拡張点を先に固定する</p>
          <ul className="list-disc pl-6">
            <li>UserPool Trigger として `preAuthentication / preTokenGeneration / customMessage` を接続する</li>
            <li>`clientId -&gt; clientName` マップは SSM Parameter Store で管理する</li>
            <li>custom attributes は `custom:institution_id / custom:mfa_preference` を使う</li>
          </ul>
        </section>

        <section>
          <p className="font-medium">フロント認証導線: ログインからMFA確認までを一貫した方式で処理する</p>
          <ul className="list-disc pl-6">
            <li>Amplify Auth の `signIn -&gt; nextStep -&gt; confirmSignIn` で実装する</li>
            <li>runtime 設定は `config.js (window.__CONFIG__)` から解決する</li>
            <li>Cognito 必須キーは `cognitoRegion / userPoolId / userPoolClientId` とする</li>
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}
