/*
 * # アクセストークン保存ユーティリティ
 *
 * ## 目的
 * ブラウザ LocalStorage のトークン入出力を共通化する。
 *
 * ## 説明
 * 取得・保存・削除を単一モジュールへ集約し、キー名の重複定義を防ぐ。
 */
const ACCESS_TOKEN_KEY = "pf.auth.accessToken";

export function getAccessToken(): string | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)?.trim();
  return token || null;
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
