// src/components/ui/tooltip.tsx
import { PropsWithChildren } from "react";

export function TooltipProvider({ children }: PropsWithChildren) {
  // ダミー実装：そのまま子を返すだけ
  return <>{children}</>;
}

// 将来 shadcn/ui に置き換える前提のダミー
export function Tooltip({ children }: PropsWithChildren) {
  return <>{children}</>;
}
export function TooltipTrigger({ children }: PropsWithChildren) {
  return <>{children}</>;
}
export function TooltipContent({ children }: PropsWithChildren) {
  return <>{children}</>;
}
