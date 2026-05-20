import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

/*
 * # 1.architecture ページ
 *
 * ## 目的
 * docs/overview/1.architecture のAWSインフラ図を Web から参照できるようにする。
 */
export function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1.architecture</CardTitle>
          <CardDescription>AWSインフラ構成</CardDescription>
        </CardHeader>
        <CardContent>
          <img
            alt="AWSインフラ構成"
            className="h-auto w-full rounded-md border border-border bg-white"
            src="/architecture/aws-infra-clean.svg"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1.architecture (local-dev)</CardTitle>
          <CardDescription>AWSローカル実行構成（launch.json: local-dev: web+functions）</CardDescription>
        </CardHeader>
        <CardContent>
          <img
            alt="AWSローカル実行構成（launch.json: local-dev: web+functions）"
            className="h-auto w-full rounded-md border border-border bg-white"
            src="/architecture/aws-local-dev.svg"
          />
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-foreground">
            <li>ローカル実行時の IoT 接続は、Frontend Local（ブラウザ）から IoT Core へ MQTT over WSS で直接接続する。</li>
            <li>認証は Custom Authorizer を利用し、Cognito トークン前提で接続する。</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
