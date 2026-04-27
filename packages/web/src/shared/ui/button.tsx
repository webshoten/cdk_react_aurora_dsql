import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils.ts";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

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
 * - buttonVariants も export しているため、span 等を「ボタン外観だけ」着せたい用途で再利用できる（AppLayout のナビ項目等）。
 */
export function Button({ className, size, type = "button", variant, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ className, size, variant }))} type={type} {...props} />
  );
}
