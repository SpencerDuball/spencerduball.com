import * as React from "react";

import { cn } from "~/util/util";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "focus-outline flex min-h-[80px] w-full rounded-md border border-slate-3 dark:border-slatedark-3 bg-slate-1 dark:bg-slatedark-1 px-3 py-2 text-sm placeholder:text-slate-9 dark:placeholder:text-slatedark-9 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
