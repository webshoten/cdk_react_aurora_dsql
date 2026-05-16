import { Link } from "react-router-dom";

const MAIN_LINK_ITEMS = [
  {
    title: "データ表示サンプル",
    path: "/feature-use-cases/11-1.data-01",
    description: "11-1.data-01",
  },
  {
    title: "データ&画像表示サンプル",
    path: "/feature-use-cases/11-2.data-02",
    description: "11-2.data-02",
  },
  {
    title: "AWS IoTによるMQTT通信サンプル",
    path: "/feature-use-cases/11-11.iot-01",
    description: "11-11.iot-01",
  },
] as const;

/*
 * # Main リンクマップ
 *
 * ## 目的
 * main ページで表示する遷移先カード一覧を管理する。
 */
export function MainLinkMap() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold">機能サンプル</p>
        <p className="text-xs text-muted-foreground">確認したいページへ移動してください。</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MAIN_LINK_ITEMS.map((item) => (
          <Link
            className="block rounded-md border border-border p-3 transition-colors hover:bg-muted/40"
            key={item.path}
            to={item.path}
          >
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
