import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

type InfraResourcePlaceholderPageProps = {
  id: string;
};

export function InfraResourcePlaceholderPage({ id }: InfraResourcePlaceholderPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{id}</CardTitle>
        <CardDescription>準備中</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">TBD</p>
      </CardContent>
    </Card>
  );
}
