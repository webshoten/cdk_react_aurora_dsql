import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createRequest,
  type OperationContext,
  type OperationResult,
  type RequestPolicy,
  type UseMutationResponse,
  type UseMutationState,
  useClient,
  useQuery,
} from "urql";
import { pipe, toPromise } from "wonka";
import {
  generateMutationOp,
  generateQueryOp,
  type MutationResult,
  type QueryResult,
} from "./genql/index.ts";
import type { MutationGenqlSelection, QueryGenqlSelection } from "./genql/schema.ts";

/*
 * # typed query hook
 *
 * ## 目的
 * genql 生成選択オブジェクトを urql の useQuery へ接続する。
 */
export function useTypedQuery<Query extends QueryGenqlSelection>(opts: {
  query: Query;
  pause?: boolean;
  requestPolicy?: RequestPolicy;
  context?: Partial<OperationContext>;
}) {
  const { query, variables } = useMemo(() => generateQueryOp(opts.query), [opts.query]);

  return useQuery<QueryResult<Query>>({
    ...opts,
    query,
    variables,
  });
}

const initialState = {
  stale: false,
  fetching: false,
  data: undefined,
  error: undefined,
  operation: undefined,
  extensions: undefined,
  hasNext: false,
};

/*
 * # typed mutation hook
 *
 * ## 目的
 * genql 生成選択オブジェクトから mutation 実行関数を生成する。
 *
 * ## 説明
 * urql の mutation state 形式を維持しつつ、selection から query/variables を組み立てる。
 */
export function useTypedMutation<
  Variables extends Record<string, unknown>,
  Mutation extends MutationGenqlSelection,
  Data extends MutationResult<Mutation>,
>(
  builder: (vars: Variables) => Mutation,
  opts?: Partial<OperationContext>,
): UseMutationResponse<Data, Variables> {
  const client = useClient();
  const isMounted = useRef(true);
  const [state, setState] = useState<UseMutationState<Data, Variables>>(initialState);

  const stableOpts = useMemo(() => opts, [opts]);

  const builderRef = useRef(builder);
  builderRef.current = builder;

  const executeMutation = useCallback(
    (
      vars?: Variables,
      context?: Partial<OperationContext>,
    ): Promise<OperationResult<Data, Variables>> => {
      setState({ ...initialState, fetching: true });
      const buildArgs = vars ?? ({} as Variables);
      const built = builderRef.current(buildArgs);
      const { query, variables } = generateMutationOp(built);

      return pipe(
        client.executeMutation<Data, Variables>(createRequest(query, variables as Variables), {
          ...stableOpts,
          ...context,
        }),
        toPromise,
      ).then((result: OperationResult<Data, Variables>) => {
        if (isMounted.current) {
          setState({
            fetching: false,
            stale: Boolean(result.stale),
            data: result.data,
            error: result.error,
            extensions: result.extensions,
            operation: result.operation,
            hasNext: result.hasNext,
          });
        }

        return result;
      });
    },
    [client, stableOpts],
  );

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return [state, executeMutation as unknown as UseMutationResponse<Data, Variables>[1]];
}

/*
 * # typed query 実行（非hook）
 *
 * ## 目的
 * hook 外（イベントハンドラや補助処理）から typed query を実行する。
 */
export function executeTypedQuery<Query extends QueryGenqlSelection>(
  client: ReturnType<typeof useClient>,
  query: Query,
  opts?: Partial<OperationContext>,
) {
  const { query: q, variables } = generateQueryOp(query);
  const request = createRequest<QueryResult<typeof query>>(q, variables);

  return client.executeQuery(request, opts).toPromise();
}

/*
 * # typed mutation 実行（非hook）
 *
 * ## 目的
 * hook 外（イベントハンドラや補助処理）から typed mutation を実行する。
 */
export function executeTypedMutation<Mutation extends MutationGenqlSelection>(
  client: ReturnType<typeof useClient>,
  mutation: Mutation,
  opts?: Partial<OperationContext>,
) {
  const { query, variables } = generateMutationOp(mutation);
  const request = createRequest<MutationResult<typeof mutation>>(query, variables);

  return client.executeMutation(request, opts).toPromise();
}
