export interface FeatureUseCasesNavItem {
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
  { label: "debug", to: "/debug" },
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
  { label: "11.feature-use-cases" },
];

/*
 * # feature-use-cases ナビ項目
 *
 * ## 目的
 * AppLayout のサイドバー下段。機能ユースケース配下の各検証ページへの導線。
 *
 * ## 説明
 * `to` 未指定の項目は未実装 placeholder（OVERVIEW_NAV_ITEMS と同様）。
 */
export const FEATURE_USE_CASES_NAV_ITEMS: FeatureUseCasesNavItem[] = [
  { label: "11-1.data-01", to: "/feature-use-cases/11-1.data-01" },
  { label: "11-2.data-02", to: "/feature-use-cases/11-2.data-02" },
  { label: "11-3.auth-01", to: "/feature-use-cases/11-3.auth-01" },
  { label: "11-4.auth-02", to: "/feature-use-cases/11-4.auth-02" },
  { label: "11-5.ops-01" },
  { label: "11-6.oplog-01" },
  { label: "11-7.oplog-02" },
  { label: "11-8.livekit-01" },
  { label: "11-9.video-01" },
  { label: "11-10.video-auth-01" },
  { label: "11-11.iot-01" },
  { label: "11-12.iot-02" },
  { label: "11-13.maintenance-01" },
];
