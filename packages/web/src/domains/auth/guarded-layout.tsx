import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/domains/auth/context/auth-context.tsx";

/*
 * # 認証ガードレイアウト
 *
 * ## 目的
 * 未認証アクセスを `/login` へリダイレクトする。
 *
 * ## 説明
 * 認証済みの場合のみ子ルートを表示し、保護対象ページの共通ガードとして利用する。
 */
export function GuardedLayout() {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState !== "authenticated") {
    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
