import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/util/util";

const toggleVariants = cva("inline-flex items-center justify-center rounded-md text-sm font-medium focus-outline", {
  variants: {
    size: {
      xs: "h-6 min-w-6 text-sm [&>svg]:h-3.5 [&>svg]:w-3.5",
      sm: "h-8 min-w-8 text-sm [&>svg]:h-3.5 [&>svg]:w-3.5",
      md: "h-10 min-w-10 text-base [&>svg]:h-4 [&>svg]:w-4",
      lg: "h-12 min-w-12 text-lg [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]",
    },
    variant: {
      solid:
        "bg-slate-3 text-slate-12 hover:text-slate-11 disabled:text-slate-12 data-[state=on]:bg-slate-12 data-[state=on]:text-slate-1",
      ghost:
        "text-slate-12 hover:bg-slate-3 hover:text-slate-11 disabled:bg-transparent disabled:text-slate-12 data-[state=on]:bg-slate-3 data-[state=on]:text-slate-12",
      outline:
        "text-slate-12 hover:bg-slate-3 hover:text-slate-11 disabled:bg-transparent disabled:text-slate-12 data-[state=on]:bg-slate-3 data-[state=on]:text-slate-12 border border-slate-6",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
  },
  defaultVariants: {
    variant: "ghost",
    size: "md",
  },
});

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, disabled, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, disabled, className }))}
    disabled={!!disabled}
    aria-disabled={!!disabled}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
