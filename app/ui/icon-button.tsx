import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { buttonConfig } from ".";
import { cn } from "~/util/util";

const iconButtonVariants = cva(
  "focus-outline rounded-md relative grid grid-flow-col place-items-center gap-2 auto-cols-max justify-center",
  {
    ...buttonConfig,
    variants: {
      ...buttonConfig.variants,
      size: {
        xs: "w-6 h-6 text-xs [&>svg]:h-3.5 [&>svg]:w-3.5",
        sm: "w-8 h-8 text-sm [&>svg]:h-3.5 [&>svg]:w-3.5",
        md: "w-10 h-10 text-base [&>svg]:h-4 [&>svg]:w-4",
        lg: "w-12 h-12 text-lg [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]",
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
