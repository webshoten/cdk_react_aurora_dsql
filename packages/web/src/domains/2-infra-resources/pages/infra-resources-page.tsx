import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";

const INFRA_RESOURCE_ITEMS = [
  { label: "2-1.shared-stack", to: "/overview/2.infra-resources/2-1.shared-stack" },
  { label: "2-2.db-stack", to: "/overview/2.infra-resources/2-2.db-stack" },
  { label: "2-3.api-stack", to: "/overview/2.infra-resources/2-3.api-stack" },
  { label: "2-4.ops-stack", to: "/overview/2.infra-resources/2-4.ops-stack" },
  { label: "2-5.storage-stack", to: "/overview/2.infra-resources/2-5.storage-stack" },
  { label: "2-6.web-stack", to: "/overview/2.infra-resources/2-6.web-stack" },
  { label: "2-7.auth-stack", to: "/overview/2.infra-resources/2-7.auth-stack" },
  { label: "2-8.domain", to: "/overview/2.infra-resources/2-8.domain" },
] as const;

export function InfraResourcesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2.infra-resources</CardTitle>
        <CardDescription>インフラリソース章の子ページ一覧</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {INFRA_RESOURCE_ITEMS.map((item) => (
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
