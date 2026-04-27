import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils.ts";

/*
 * # Card コンポーネント群
 *
 * ## 目的
 * shadcn/ui ベースの Card 一式（Card / Header / Title / Description / Content）。アプリ全体で枠付き情報ブロックの表現を揃える。
 *
 * ## 説明
 * 各サブ要素は単純な div / h3 / p のスタイル付きラッパー。Card 直下に Header（Title + Description）と Content を並べる構成を想定。
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
