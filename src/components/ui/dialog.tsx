// src/components/ui/dialog.tsx
import React, { PropsWithChildren, HTMLAttributes } from "react";

type Openable = { open?: boolean; onOpenChange?: (v: boolean) => void };

export function Dialog({ children, open = false }: PropsWithChildren<Openable>) {
  return <div style={{ display: open ? "block" : "none" }}>{children}</div>;
}

export function DialogTrigger({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function DialogContent({ children }: PropsWithChildren) {
  return (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  );
}

export function DialogHeader({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}

export function DialogTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 {...props} />;
}

export function DialogDescription(props: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} />;
}

export function DialogFooter({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}
