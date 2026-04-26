import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card.tsx";

interface PlaceholderPageProps {
  description: string;
  title: string;
}

export function PlaceholderPage({ description, title }: PlaceholderPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">このページは次フェーズで実装します。</p>
      </CardContent>
    </Card>
  );
}
