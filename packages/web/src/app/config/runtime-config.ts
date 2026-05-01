declare global {
  interface Window {
    __CONFIG__?: {
      apiUrl?: string;
      cognitoRegion?: string;
      userPoolId?: string;
      userPoolClientId?: string;
    };
  }
}

export interface AuthRuntimeConfig {
  cognitoRegion: string;
  userPoolClientId: string;
  userPoolId: string;
}

/*
 * # 実行時 API URL 解決
 *
 * ## 目的
 * Web ビルドに焼き込まず、CloudFront 配信時に注入される config.js の apiUrl を取り出す。デプロイ毎の URL 差し替えを再ビルドなしで吸収する起点。
 *
 * ## 説明
 * window.__CONFIG__.apiUrl を trim して返す。未設定または空白のみは null。
 *
 * ## NOTE
 * - 外部直接利用なし。resolveGraphqlUrl 内部で使用。エクスポートは残すか要判断。
 */
export function resolveApiUrl(): string | null {
  const apiUrl = window.__CONFIG__?.apiUrl?.trim();
  if (!apiUrl) return null;

  return apiUrl;
}

/*
 * # GraphQL エンドポイント URL 解決
 *
 * ## 目的
 * GraphQL クライアント（urql）に渡す絶対 URL を runtime config から組み立てる。
 *
 * ## 説明
 * apiUrl 末尾スラッシュを正規化し /graphql を付与。apiUrl 未解決時は null（呼び出し側で設定エラー扱い）。
 */
export function resolveGraphqlUrl(): string | null {
  const apiUrl = resolveApiUrl();
  if (!apiUrl) return null;

  return `${apiUrl.replace(/\/$/, "")}/graphql`;
}

/*
 * # 設定エラーメッセージ取得（apiUrl 未設定検出）
 *
 * ## 目的
 * 画面側で apiUrl 未設定状態を検出して表示する共通エラーメッセージ供給。
 *
 * ## 説明
 * GraphQL URL が解決できない場合のみ固定メッセージを返す。正常時は null。
 */
export function resolveConfigError(): string | null {
  if (!resolveGraphqlUrl()) return "config.js の apiUrl が未設定";
  if (!resolveAuthConfig()) return "config.js の Cognito 設定が未設定";
  return null;
}

export function resolveAuthConfig(): AuthRuntimeConfig | null {
  const cognitoRegion = window.__CONFIG__?.cognitoRegion?.trim();
  const userPoolId = window.__CONFIG__?.userPoolId?.trim();
  const userPoolClientId = window.__CONFIG__?.userPoolClientId?.trim();
  if (!cognitoRegion || !userPoolId || !userPoolClientId) return null;

  return {
    cognitoRegion,
    userPoolId,
    userPoolClientId,
  };
}
