import { Card, CardContent, CardHeader } from "@/shared/ui/card.tsx";
import { MainLinkMap } from "../components/main-link-map.tsx";

/*
 * # トップページ（プレースホルダ）
 *
 * ## 目的
 * "/" ルートに割り当てるトップページ。debug と同じカード枠でリンクマップを表示する。
 *
 * ## NOTE
 * - リンク一覧の表示責務は components へ分離する。
 * - 他 domain と異なり route.tsx を持たず、router.tsx から直接 MainPage を参照している。
 */
export function MainPage() {
  return (
    <Card>
      <CardHeader />
      <CardContent>
        <MainLinkMap />
      </CardContent>
    </Card>
  );
}
