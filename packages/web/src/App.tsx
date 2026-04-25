import { useEffect, useState } from "react";

declare global {
  interface Window {
    __CONFIG__?: {
      apiUrl?: string;
    };
  }
}

const API_URL = window.__CONFIG__?.apiUrl ?? "";

type GraphqlResponse = {
  data?: {
    hello?: number | null;
  };
  errors?: Array<{
    message: string;
  }>;
};

export function App() {
  const [data, setData] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setError("config.js の apiUrl が未設定");
      return;
    }

    fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: "query { hello }",
      }),
    })
      .then(async (r) => {
        const json = (await r.json()) as GraphqlResponse;
        if (json.errors?.length) {
          throw new Error(json.errors.map((x) => x.message).join(", "));
        }
        setData(json.data?.hello ?? null);
      })
      .catch((e: unknown) => setError(String(e)));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>cdk-pf</h1>
      <p>API URL: {API_URL || "(unset)"}</p>
      {error && <pre style={{ color: "crimson" }}>{error}</pre>}
      {data !== null && <pre>{JSON.stringify({ hello: data }, null, 2)}</pre>}
    </main>
  );
}
