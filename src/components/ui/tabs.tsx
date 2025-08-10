import React, { PropsWithChildren, HTMLAttributes } from 'react'

export function Tabs({ children }: PropsWithChildren) { return <div>{children}</div> }
export function TabsList({ children }: PropsWithChildren) { return <div>{children}</div> }
export function TabsTrigger({ children, ...rest }: HTMLAttributes<HTMLButtonElement>) {
  return <button {...rest}>{children}</button>
}
export function TabsContent({ children }: PropsWithChildren) { return <div>{children}</div> }
