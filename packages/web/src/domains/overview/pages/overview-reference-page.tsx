import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

interface OverviewReferencePageProps {
  description: string;
  docPath: string;
  title: string;
}

/*
 * # overview 参照ページ
 *
 * ## 目的
 * ナビゲーションから各 overview 正本ドキュメントへの参照先を確認できるページを表示する。
 */
export function OverviewReferencePage({ description, docPath, title }: OverviewReferencePageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium">参照先ドキュメント</p>
          <p className="mt-2 text-muted-foreground">
            <code>{docPath}</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
