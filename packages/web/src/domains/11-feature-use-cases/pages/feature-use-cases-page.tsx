import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

const FEATURE_USE_CASE_ITEMS = [
  { label: "11-1.data-01", to: "/overview/11.feature-use-cases/11-1.data-01" },
  { label: "11-2.data-02", to: "/overview/11.feature-use-cases/11-2.data-02" },
  { label: "11-3.auth-01", to: "/overview/11.feature-use-cases/11-3.auth-01" },
  { label: "11-4.auth-02", to: "/overview/11.feature-use-cases/11-4.auth-02" },
  { label: "11-11.iot-01", to: "/overview/11.feature-use-cases/11-11.iot-01" },
] as const;

export function FeatureUseCasesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>11.feature-use-cases</CardTitle>
        <CardDescription>機能サンプル章の子ページ一覧</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURE_USE_CASE_ITEMS.map((item) => (
            <Link
              className="block rounded-md border border-border p-3 text-sm transition-colors hover:bg-muted/40"
              key={item.to}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
