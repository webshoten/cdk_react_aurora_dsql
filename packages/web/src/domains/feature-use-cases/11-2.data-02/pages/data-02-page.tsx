import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

/*
 * # 11-2.data-02 ページ（プレースホルダ）
 *
 * ## 目的
 * データフロー検証の 2 例目を載せる予定の枠だけ確保する未実装ページ。
 *
 * ## NOTE
 * - 実装着手時に実コンテンツへ差し替える。
 */
export function Data02Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>11-2.data-02</CardTitle>
        <CardDescription>
          医療者Web表示（React + GraphQL Lambda + S3 Presigned URL）
        </CardDescription>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium">このページで確認する仕様</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>S3 Presigned URL を介したデータ取得フローを確認できること</li>
            <li>GraphQL とオブジェクトストレージ連携の責務分離を確認できること</li>
            <li>詳細仕様は後続フェーズで追加し、このページに追記すること</li>
          </ul>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">このページは次フェーズで実装します。</p>
      </CardContent>
    </Card>
  );
}
