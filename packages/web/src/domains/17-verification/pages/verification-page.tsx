import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

export function VerificationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>17.verification</CardTitle>
        <CardDescription>検証フェーズの正本</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium">参照先ドキュメント</p>
          <p className="mt-2 text-muted-foreground">
            <code>docs/overview/17.verification/overview.md</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
