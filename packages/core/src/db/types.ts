/*
 * # クエリ結果ラッパ
 *
 * ## 目的
 * GraphQL resolver が読み取る DB クエリ結果の最小形。
 *
 * ## 説明
 * pg.QueryResult のうち rows のみを露出。rowCount 等の付随情報は意図的に非公開。
 */
export interface DbQueryResult<T> {
  rows: T[];
}

/*
 * # SQL 実行クライアント抽象
 *
 * ## 目的
 * GraphQL resolver が DB アクセススコープ内で発行する SQL の最小インタフェース。
 *
 * ## 説明
 * query 1 メソッドだけに絞り、ドライバ実装（pg.Client 等）を resolver から隠蔽する。
 *
 * ## NOTE
 * - 型パラメタ T はランタイム検証無し。SELECT 列と T の整合は呼び出し側責任。
 */
export interface SqlClient {
  query<T>(sql: string, params?: readonly unknown[]): Promise<DbQueryResult<T>>;
}

/*
 * # DB アクセススコープ型
 *
 * ## 目的
 * GraphQL resolver が「接続の存在/寿命を意識せず」クエリを書けるようにする境界型。
 *
 * ## 説明
 * fn 内に SqlClient を渡し、外側で connect/close を完結させる高階関数。
 *
 * ## NOTE
 * - 実装側（createDsqlClient）は callback に pg.Client 全体を渡しており、
 *   この型が約束する SqlClient より広い API を露出している。型と実体に乖離あり。
 *   resolver が pg.Client 固有 API（例: `client.query("BEGIN")`）に依存し始めると、
 *   差し替え用モックも pg.Client 互換を要求される点に注意。
 */
export type DbClient = <T>(fn: (client: SqlClient) => Promise<T>) => Promise<T>;
