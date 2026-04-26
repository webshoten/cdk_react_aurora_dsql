import type { Client } from "pg";

/*
 * # SQL 実行クライアント抽象
 *
 * ## 目的
 * GraphQL resolver が DB アクセススコープ内で発行する SQL の最小インタフェース。
 *
 * ## 説明
 * Drizzle を使ったクエリ構築に対応するため、pg.Client をそのまま露出する。
 */
export type SqlClient = Client;

/*
 * # DB アクセススコープ型
 *
 * ## 目的
 * GraphQL resolver が「接続の存在/寿命を意識せず」クエリを書けるようにする境界型。
 *
 * ## 説明
 * fn 内に pg.Client を渡し、外側で connect/close を完結させる高階関数。
 */
export type DbClient = <T>(fn: (client: SqlClient) => Promise<T>) => Promise<T>;
