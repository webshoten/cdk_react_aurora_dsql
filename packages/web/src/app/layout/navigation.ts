export interface FrontendNavItem {
  label: string;
  to?: string;
}

export interface OverviewNavItem {
  label: string;
  to?: string;
}

/*
 * # 全体ナビ項目
 *
 * ## 目的
 * AppLayout のサイドバー上段（全体構成）に並べるリンク群。プロジェクト全体の章立てを順序付きで提示する。
 *
 * ## 説明
 * `to` 未指定の項目は未実装（章番号だけ確保した placeholder）。クリック不可のラベル表示として扱う。
 */
export const OVERVIEW_NAV_ITEMS: OverviewNavItem[] = [
  { label: "main", to: "/" },
  { label: "1.architecture" },
  { label: "2.infra-resources" },
  { label: "3.backend" },
  { label: "4.frontend" },
  { label: "5.ci-cd" },
  { label: "6.deployment-operations" },
  { label: "7.open-issues" },
  { label: "8.coding-rules" },
  { label: "9.ai" },
  { label: "10.local-dev" },
];

/*
 * # frontend ドメインナビ項目
 *
 * ## 目的
 * AppLayout のサイドバー下段。frontend ドメイン配下の各機能ページへの導線。
 *
 * ## 説明
 * `to` 未指定の項目は未実装 placeholder（OVERVIEW_NAV_ITEMS と同様）。
 */
export const FRONTEND_NAV_ITEMS: FrontendNavItem[] = [
  { label: "4-1.data-01", to: "/frontend/4-1.data-01" },
  { label: "4-2.data-02", to: "/frontend/4-2.data-02" },
  { label: "4-3.auth-01", to: "/frontend/4-3.auth-01" },
  { label: "4-4.auth-02" },
  { label: "4-5.ops-01" },
  { label: "4-6.oplog-01" },
  { label: "4-7.oplog-02" },
  { label: "4-8.livekit-01" },
  { label: "4-9.video-01" },
  { label: "4-10.video-auth-01" },
  { label: "4-11.iot-01" },
  { label: "4-12.iot-02" },
  { label: "4-13.maintenance-01" },
];
