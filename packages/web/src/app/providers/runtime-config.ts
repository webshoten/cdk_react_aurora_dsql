declare global {
  interface Window {
    __CONFIG__?: {
      apiUrl?: string;
    };
  }
}

export function resolveApiUrl(): string | null {
  const apiUrl = window.__CONFIG__?.apiUrl?.trim();
  if (!apiUrl) return null;

  return apiUrl;
}

export function resolveGraphqlUrl(): string | null {
  const apiUrl = resolveApiUrl();
  if (!apiUrl) return null;

  return `${apiUrl.replace(/\/$/, "")}/graphql`;
}
