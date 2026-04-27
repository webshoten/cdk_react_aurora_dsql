import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FRONTEND_NAV_ITEMS, OVERVIEW_NAV_ITEMS } from "@/app/layout/navigation.ts";
import { cn } from "@/shared/lib/utils.ts";
import { buttonVariants } from "@/shared/ui/button.tsx";

/*
 * # サイドバー付き共通レイアウト
 *
 * ## 目的
 * 全ルート共通の枠組み。左サイドバーに目次（OVERVIEW + frontend サブ項目）、右にページ本体（Outlet）を配置する。
 *
 * ## 説明
 * - "4.frontend" 項目だけ特別扱い。クリックで FRONTEND_NAV_ITEMS の開閉トグル。
 * - `to` 未指定のナビ項目は disabled スタイル（opacity-60 + pointer-events-none）の span で表示。クリック不能のラベル扱い。
 * - 768px 未満（md 未満）は aside がページ上部、それ以上は左固定。
 */
export function AppLayout() {
  const [isFrontendOpen, setIsFrontendOpen] = useState(true);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-border bg-card md:w-72 md:border-b-0 md:border-r">
          <div className="p-4 md:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              目次
            </p>
            <div className="mt-4 space-y-2">
              {OVERVIEW_NAV_ITEMS.map((item) => (
                <div className="space-y-1" key={item.label}>
                  {item.label === "4.frontend" ? (
                    <>
                      <button
                        className={cn(
                          buttonVariants({
                            className: "w-full justify-between",
                            variant: "ghost",
                          }),
                        )}
                        onClick={() => setIsFrontendOpen((prev) => !prev)}
                        type="button"
                      >
                        <span>{item.label}</span>
                        <span className="text-xs">{isFrontendOpen ? "▼" : "▶"}</span>
                      </button>
                      {isFrontendOpen && (
                        <div className="pl-2">
                          {FRONTEND_NAV_ITEMS.map((frontendItem) =>
                            frontendItem.to ? (
                              <NavLink
                                className={({ isActive }) =>
                                  cn(
                                    buttonVariants({
                                      className: "w-full justify-start",
                                      variant: isActive ? "default" : "ghost",
                                    }),
                                  )
                                }
                                key={frontendItem.label}
                                to={frontendItem.to}
                              >
                                {frontendItem.label}
                              </NavLink>
                            ) : (
                              <span
                                className={cn(
                                  buttonVariants({
                                    className:
                                      "w-full cursor-default justify-start opacity-60 pointer-events-none",
                                    variant: "ghost",
                                  }),
                                )}
                                key={frontendItem.label}
                              >
                                {frontendItem.label}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {item.to ? (
                        <NavLink
                          className={({ isActive }) =>
                            cn(
                              buttonVariants({
                                className: "w-full justify-start",
                                variant: isActive ? "default" : "ghost",
                              }),
                            )
                          }
                          to={item.to}
                        >
                          {item.label}
                        </NavLink>
                      ) : (
                        <span
                          className={cn(
                            buttonVariants({
                              className:
                                "w-full cursor-default justify-start opacity-60 pointer-events-none",
                              variant: "ghost",
                            }),
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
