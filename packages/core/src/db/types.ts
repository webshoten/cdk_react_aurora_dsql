export interface DbQueryResult<T> {
  rows: T[];
}

export interface SqlClient {
  query<T>(sql: string, params?: readonly unknown[]): Promise<DbQueryResult<T>>;
}

export type DbClient = <T>(fn: (client: SqlClient) => Promise<T>) => Promise<T>;
