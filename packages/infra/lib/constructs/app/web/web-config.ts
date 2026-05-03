export interface WebConfigInput {
  apiUrl: string;
  cognitoRegion: string;
  userPoolClientId: string;
  userPoolId: string;
}

/*
 * # Web runtime config 生成
 *
 * ## 目的
 * `config.js` の中身文字列を生成する責務を分離する。
 */
export function buildWebConfigContent(input: WebConfigInput): string {
  return `window.__CONFIG__=${JSON.stringify({
    apiUrl: input.apiUrl,
    cognitoRegion: input.cognitoRegion,
    userPoolId: input.userPoolId,
    userPoolClientId: input.userPoolClientId,
  })};`;
}
