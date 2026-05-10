/*
 * # CLI ログ出力ヘルパー
 *
 * ## 目的
 * scripts 配下の手動実行 CLI で、共通の表示形式を使う。
 */
export function logSuccess(): void {
  console.log("\x1b[32mSuccess!\x1b[0m");
}
