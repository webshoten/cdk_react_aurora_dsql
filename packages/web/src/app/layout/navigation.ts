export interface FrontendNavItem {
  label: string;
  to?: string;
}

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
