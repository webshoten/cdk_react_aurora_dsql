import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { GraphqlAuthorizerContext } from "../graphql/context.ts";
import { yoga } from "../graphql/yoga.ts";
import { authorizeGraphqlLocalRequest } from "./graphql-authorizer.ts";

/*
 * # GraphQL ローカル開発サーバー
 *
 * ## 目的
 * Lambda にデプロイせず手元で GraphQL を叩けるようにする dev エントリ。pnpm dev 等から起動する想定。
 *
 * ## 説明
 * 受けたリクエストを Yoga に渡す。Authorization ヘッダーがある場合は
 * 疑似 authorizer で検証し、GraphQL context.authorizer へ注入する。
 * PORT 未指定時は 4000。
 */
const PORT = Number(process.env.PORT ?? 4000);

type LocalYogaRequestListener = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  context: { authorizer: GraphqlAuthorizerContext | null },
) => void;

const server = createServer(async (req, res) => {
  const authorizer = await authorizeGraphqlLocalRequest(req.headers);

  const requestListener = yoga as unknown as LocalYogaRequestListener;

  requestListener(req, res, { authorizer });
});

server.listen(PORT, () => {
  console.log(`GraphQL: http://localhost:${PORT}/graphql`);
});
