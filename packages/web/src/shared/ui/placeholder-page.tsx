import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card.tsx";

interface PlaceholderPageProps {
  description: string;
  title: string;
}

/*
 * # 未実装ページ用プレースホルダ
 *
 * ## 目的
 * 未着手ページに「次フェーズで実装」の固定文言と title / description を表示する共通コンポーネント。
 *
 * ## 説明
 * Card 一式でフォーマットを揃え、各 domain の未実装ページ（Auth01Page / Data02Page 等）が title / description だけ渡して使う。
 */
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
