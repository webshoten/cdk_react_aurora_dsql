import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/shared/lib/utils.ts";
import { buttonVariants } from "@/shared/ui/button.tsx";
import { FRONTEND_NAV_ITEMS } from "@/app/layout/navigation.ts";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-border bg-card md:w-72 md:border-b-0 md:border-r">
          <div className="p-4 md:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Navigation
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold">4.frontend</p>
              {FRONTEND_NAV_ITEMS.map((item) => (
                item.to ? (
                  <NavLink
                    className={({ isActive }) =>
                      cn(
                        buttonVariants({
                          className: "w-full justify-start",
                          variant: isActive ? "default" : "ghost",
                        }),
                      )
                    }
                    key={item.label}
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
                    key={item.label}
                  >
                    {item.label}
                  </span>
                )
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
