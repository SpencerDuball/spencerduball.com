import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "~/util";
import { buttonConfig } from "./button";

const iconButtonVariants = cva(
  "focus-outline relative grid auto-cols-max grid-flow-col place-items-center justify-center gap-2 rounded-md",
  {
    ...buttonConfig,
    variants: {
      ...buttonConfig.variants,
      size: {
        xs: "h-6 w-6 text-xs [&>svg]:h-3.5 [&>svg]:w-3.5",
        sm: "h-8 w-8 text-sm [&>svg]:h-3.5 [&>svg]:w-3.5",
        md: "h-10 w-10 text-base [&>svg]:h-4 [&>svg]:w-4",
        lg: "h-12 w-12 text-lg [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]",
      },
    },
  },
);

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  // Ensure that an "aria-label" is supplied.
  "aria-label": React.ButtonHTMLAttributes<HTMLButtonElement>["aria-label"];
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size, variant, colorScheme, disabled, className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(iconButtonVariants({ size, variant, colorScheme, disabled, className }))}
        ref={ref}
        disabled={!!disabled}
        aria-disabled={!!disabled}
        {...props}
      />
    );
  },
);

export { IconButton };
