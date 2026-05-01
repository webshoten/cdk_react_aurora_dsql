/*
 * # 必須環境変数取得
 *
 * ## 目的
 * 必須環境変数の取得処理を共通化する。
 *
 * ## 説明
 * 未設定時は例外を投げて即時 fail させる。
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
