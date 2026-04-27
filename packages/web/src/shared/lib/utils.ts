import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/*
 * # Tailwind クラス結合ヘルパー
 *
 * ## 目的
 * 条件付き class 指定を簡潔に書きつつ、Tailwind の重複ユーティリティを最後勝ちでマージする。shadcn/ui 由来の標準ヘルパー。
 *
 * ## 説明
 * clsx で truthy だけを集め、twMerge で衝突する Tailwind ユーティリティ（p-2 と p-4 等）を後勝ちに正規化。
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
