import React, { TextareaHTMLAttributes, forwardRef } from 'react'
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  return <textarea ref={ref} {...props} />
})
