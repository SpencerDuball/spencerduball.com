import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/util";

const buttonConfig = {
  variants: {
    size: {
      xs: "px-2 h-6 text-xs [&>svg]:h-3.5 [&>svg]:w-3.5",
      sm: "px-3 h-8 text-sm [&>svg]:h-3.5 [&>svg]:w-3.5",
      md: "px-4 h-10 text-sm [&>svg]:h-4 [&>svg]:w-4",
      lg: "px-6 h-12 text-base [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]",
    },
    variant: {
      solid: [],
      subtle: [],
      ghost: [],
      outline: [],
    },
    colorScheme: {
      primary: [],
      red: [],
    },
    disabled: {
      true: "opacity-40 cursor-not-allowed",
    },
  },
  compoundVariants: [
    //-----------------------------------------------------------------------------
    // Apply "primary" styles
    //-----------------------------------------------------------------------------
    // apply styles for "solid" variant
    {
      variant: "solid" as const,
      colorScheme: "primary" as const,
      className:
        "bg-slate-12 dark:bg-slatedark-12 active:bg-slate-11 dark:active:bg-slatedark-11 text-slate-1 dark:text-slatedark-1",
    },
    {
      variant: "solid" as const,
      colorScheme: "primary" as const,
      disabled: true,
      className:
        "bg-slate-9 dark:bg-slatedark-9 hover:bg-slate-9 dark:hover:bg-slatedark-9 active:bg-slate-9 dark:active:bg-slatedark-9",
    },
    // apply styles for "subtle" variant
    {
      variant: "subtle" as const,
      colorScheme: "primary" as const,
      className:
        "bg-slate-3 dark:bg-slatedark-3 hover:bg-slate-4 dark:hover:bg-slatedark-4 active:bg-slate-5 dark:active:bg-slatedark-5 text-slate-12 dark:text-slatedark-12",
    },
    {
      variant: "subtle" as const,
      colorScheme: "primary" as const,
      disabled: true,
      className:
        "bg-slate-3 dark:bg-slatedark-3 hover:bg-slate-3 dark:hover:bg-slatedark-3 active:bg-slate-3 dark:active:bg-slatedark-3",
    },
    // apply styles for "ghost" variant
    {
      variant: "ghost" as const,
      colorScheme: "primary" as const,
      className:
        "hover:bg-slate-3 dark:hover:bg-slatedark-3 active:bg-slate-4 dark:active:bg-slatedark-4 text-slate-12 dark:text-slatedark-12",
    },
    {
      variant: "ghost" as const,
      colorScheme: "primary" as const,
      disabled: true,
      className: "hover:bg-transparent active:bg-transparent",
    },
    // apply styles for "outline" variant
    {
      variant: "outline" as const,
      colorScheme: "primary" as const,
      className:
        "border border-slate-6 dark:border-slatedark-6 hover:bg-slate-3 dark:hover:bg-slatedark-3 active:bg-slate-4 dark:active:bg-slatedark-4 text-slate-12 dark:text-slatedark-12",
    },
    {
      variant: "outline" as const,
      colorScheme: "primary" as const,
      disabled: true,
      className: "hover:bg-transparent active:bg-transparent",
    },
    // copy "slate" variants to other colors ...
    //-----------------------------------------------------------------------------
    // Apply "red" styles
    //-----------------------------------------------------------------------------
    // apply styles for "solid" variant
    {
      variant: "solid" as const,
      colorScheme: "red" as const,
      className:
        "bg-red-9 dark:bg-reddark-9 hover:bg-red-9 dark:hover:bg-reddark-9 active:bg-red-10 dark:active:bg-reddark-10 text-red-1 dark:text-reddark-1",
    },
    {
      variant: "solid" as const,
      colorScheme: "red" as const,
      disabled: true,
      className:
        "bg-red-9 dark:bg-reddark-9 hover:bg-red-9 dark:hover:bg-reddark-9 active:bg-red-9 dark:active:bg-reddark-9",
    },
    // apply styles for "subtle" variant
    {
      variant: "subtle" as const,
      colorScheme: "red" as const,
      className:
        "bg-red-9 dark:bg-reddark-3 hover:bg-red-4 dark:hover:bg-reddark-4 active:bg-red-5 dark:active:bg-reddark-5 text-red-9 dark:text-reddark-9",
    },
    {
      variant: "subtle" as const,
      colorScheme: "red" as const,
      disabled: true,
      className:
        "bg-red-3 dark:bg-reddark-3 hover:bg-red-3 dark:hover:bg-reddark-3 active:bg-red-3 dark:active:bg-reddark-3",
    },
    // apply styles for "ghost" variant
    {
      variant: "ghost" as const,
      colorScheme: "red" as const,
      className:
        "hover:bg-red-3 dark:hover:bg-reddark-3 active:bg-red-4 dark:active:bg-reddark-4 text-red-9 dark:text-reddark-9",
    },
    {
      variant: "ghost" as const,
      colorScheme: "red" as const,
      disabled: true,
      className: "hover:bg-transparent active:bg-transparent",
    },
    // apply styles for "outline" variant
    {
      variant: "outline" as const,
      colorScheme: "red" as const,
      className:
        "border border-red-8 dark:border-reddark-8 hover:bg-red-3 dark:hover:bg-reddark-3 active:bg-red-4 dark:active:bg-reddark-4 text-red-9 dark:text-reddark-9",
    },
    {
      variant: "outline" as const,
      colorScheme: "red" as const,
      disabled: true,
      className: "hover:bg-transparent active:bg-transparent",
    },
  ],
  defaultVariants: {
    size: "md" as const,
    variant: "subtle" as const,
    colorScheme: "primary" as const,
  },
};
const buttonVariants = cva(
  "focus-outline inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
  buttonConfig,
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size, variant, colorScheme, disabled, className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ size, variant, colorScheme, disabled, className }))}
        ref={ref}
        disabled={!!disabled}
        aria-disabled={!!disabled}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonConfig, buttonVariants };
