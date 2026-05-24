import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils.ts";
import { buttonVariants } from "@/shared/ui/button-variants.ts";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

/*
 * # 共通 Button コンポーネント
 *
 * ## 目的
 * shadcn/ui ベースの汎用ボタン。アプリ全体で variant / size 揃った操作 UI を提供する。
 *
 * ## 説明
 * - cva で variant（default / ghost / outline）と size（default / sm）を定義。
 * - type の既定値を "button" に明示し、フォーム内誤 submit を防ぐ。
 * - 見た目定義（buttonVariants）は button-variants.ts に分離し、Fast Refresh の制約に合わせる。
 */
export function Button({ className, size, type = "button", variant, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ className, size, variant }))} type={type} {...props} />
  );
}
