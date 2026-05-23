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
          <CardTitle>architecture</CardTitle>
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
          <CardTitle>architecture (local-dev)</CardTitle>
          <CardDescription>AWSローカル実行構成（launch.json: local-dev: web+functions）</CardDescription>
        </CardHeader>
        <CardContent>
          <img
            alt="AWSローカル実行構成（launch.json: local-dev: web+functions）"
            className="h-auto w-full rounded-md border border-border bg-white"
            src="/architecture/aws-local-dev.svg"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>architecture (stack-composition)</CardTitle>
          <CardDescription>Stack構成図（依存関係 / 順序ガイド）</CardDescription>
        </CardHeader>
        <CardContent>
          <img
            alt="Stack構成図（依存関係 / 順序ガイド）"
            className="h-auto w-full rounded-md border border-border bg-white"
            src="/architecture/stack-composition.svg"
          />
        </CardContent>
      </Card>
    </div>
  );
}
