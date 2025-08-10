// src/components/ui/button.tsx
import * as React from "react";

type Variant = "default" | "outline" | "ghost" | "secondary" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "default",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<Variant, string> = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-100",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={[base, variants[variant], sizes[size], className].join(" ")}
      {...props}
    />
  );
}
