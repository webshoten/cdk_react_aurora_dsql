import { createServer } from "node:http";
import { yoga } from "../graphql/yoga.ts";

/*
 * # GraphQL ローカル開発サーバー
 *
 * ## 目的
 * Lambda にデプロイせず手元で GraphQL を叩けるようにする dev エントリ。pnpm dev 等から起動する想定。
 *
 * ## 説明
 * /health は固定 200 を返し、それ以外のリクエストは Yoga にそのまま渡す薄いルーター。
 * PORT 未指定時は 4000。
 */
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
