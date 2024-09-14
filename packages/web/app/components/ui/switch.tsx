import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/util";

// There is some math to figure out what the sizes of both the 'switchConfig' and the 'switchThumbConfig'. The math
// starts with the thumb, we need to ensure that all items are even pixel sizes, or else we will get very funky looking
// UI elements, and resizing will show distortions.
//
// 1) Pick a height/width for the 'switchThumbConfig'. Now add a margin such as 3px. To support the invalid state
//    we need to subtract the border width of the 'switchConfig':
//    translateX   = marginWidth - borderWidth
// 2) The math for the 'switchConfig' follows the formula:
//    switchHeight = thumbSize + marginSize*2
//    switchWidth  = thumbSize*2 + marginSize*2

const switchConfig = {
  variants: {
    size: {
      xs: "h-[calc(theme(size.3)+3px*2)] w-[calc(theme(size.3)*2+3px*2)]",
      sm: "h-[calc(theme(size.4)+3px*2)] w-[calc(theme(size.4)*2+3px*2)]",
      md: "h-[calc(theme(size.5)+3px*2)] w-[calc(theme(size.5)*2+3px*2)]",
      lg: "h-[calc(theme(size.6)+3px*2)] w-[calc(theme(size.6)*2+3px*2)]",
    },
    colorScheme: {
      primary:
        "data-[state=checked]:border-slate-12 dark:data-[state=checked]:border-slatedark-12 data-[state=unchecked]:border-slate-3 dark:data-[state=unchecked]:border-slatedark-3 data-[state=checked]:bg-slate-12 dark:data-[state=checked]:bg-slatedark-12 data-[state=unchecked]:bg-slate-3 dark:data-[state=unchecked]:bg-slatedark-3",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
    invalid: {
      true: "data-[state=checked]:border-red-9 dark:data-[state=checked]:border-reddark-9 data-[state=unchecked]:border-red-9 dark:data-[state=unchecked]:border-reddark-9",
    },
  },
  defaultVariants: {
    size: "md" as const,
    colorScheme: "primary" as const,
  },
};
const switchVariants = cva(
  "focus-outline peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent",
  switchConfig,
);

const switchThumbConfig = {
  variants: {
    size: {
      xs: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0 m-[calc(3px-1px)]",
      sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 m-[calc(3px-1px)]",
      md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 m-[calc(3px-1px)]",
      lg: "h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 m-[calc(3px-1px)]",
    },
    colorScheme: {
      primary: "bg-slate-1 dark:bg-slatedark-1",
    },
  },
  defaultVariants: {
    size: "md" as const,
    colorScheme: "primary" as const,
  },
};
const switchThumbVariants = cva(
  "pointer-events-none block rounded-full shadow-lg transition-transform",
  switchThumbConfig,
);

interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, "disabled">,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ size, colorScheme, disabled, invalid, className, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(switchVariants({ size, colorScheme, disabled, invalid }), className)}
      disabled={!!disabled}
      aria-disabled={!!disabled}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb className={cn(switchThumbVariants({ size, colorScheme }))} />
    </SwitchPrimitives.Root>
  ),
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch, type SwitchProps };
