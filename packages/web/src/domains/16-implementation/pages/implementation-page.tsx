import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

export function ImplementationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>16.implementation</CardTitle>
        <CardDescription>実装フェーズの正本</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium">参照先ドキュメント</p>
          <p className="mt-2 text-muted-foreground">
            <code>docs/overview/16.implementation/overview.md</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
