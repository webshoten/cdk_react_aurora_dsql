/*
 * # トップページ（プレースホルダ）
 *
 * ## 目的
 * "/" ルートに割り当てる空ページ。サイドバー（AppLayout）だけ表示してメイン領域は空のままにする。
 *
 * ## NOTE
 * - 中身が必要になったらここに描画する。現状は意図的に null。
 * - 他 domain と異なり route.tsx を持たず、router.tsx から直接 MainPage を参照している。
 */
export function MainPage() {
  return null;
}
