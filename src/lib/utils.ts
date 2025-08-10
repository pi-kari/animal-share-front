// src/lib/utils.ts

// shadcn/ui とかでよく使う className 合成ユーティリティ
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
