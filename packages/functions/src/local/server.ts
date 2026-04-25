import { createServer } from "node:http";
import { yoga } from "../graphql/yoga.ts";

const PORT = Number(process.env.PORT ?? 4000);

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  yoga(req, res);
});

server.listen(PORT, () => {
  console.log(`GraphQL: http://localhost:${PORT}/graphql`);
});
