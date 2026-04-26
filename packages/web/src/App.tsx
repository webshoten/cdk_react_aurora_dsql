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
    seedItems?: Array<{
      code: string;
      label: string;
    }>;
  };
  errors?: Array<{
    message: string;
  }>;
};

export function App() {
  const [seedItems, setSeedItems] = useState<Array<{ code: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setError("config.js の apiUrl が未設定");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: "query { seedItems { code label } }",
      }),
    })
      .then(async (r) => {
        const json = (await r.json()) as GraphqlResponse;
        if (json.errors?.length) {
          throw new Error(json.errors.map((x) => x.message).join(", "));
        }
        setSeedItems(json.data?.seedItems ?? []);
      })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>cdk-pf</h1>
      {error && <pre style={{ color: "crimson" }}>{error}</pre>}
      {!error && loading && <p>loading...</p>}
      {!error && !loading && seedItems.length === 0 && <p>seedItems: 0</p>}
      {!error && !loading && seedItems.length > 0 && <pre>{JSON.stringify({ seedItems }, null, 2)}</pre>}
    </main>
  );
}
