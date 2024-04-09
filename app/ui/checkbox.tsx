import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { RiCheckFill } from "react-icons/ri";

import { cn } from "~/util/util";
import { cva, type VariantProps } from "class-variance-authority";

const checkboxConfig = {
  variants: {
    size: {
      xs: "h-2 w-2 [&>span>svg]:h-[calc(theme(size.2)-2px)] [&>span>svg]:w-[calc(theme(size.2)-2px)]",
      sm: "h-3 w-3 [&>span>svg]:h-[calc(theme(size.3)-2px)] [&>span>svg]:w-[calc(theme(size.3)-2px)]",
      md: "h-4 w-4 [&>span>svg]:h-[calc(theme(size.4)-2px)] [&>span>svg]:w-[calc(theme(size.4)-2px)]",
      lg: "h-5 w-5 [&>span>svg]:h-[calc(theme(size.5)-2px)] [&>span>svg]:w-[calc(theme(size.5)-2px)]",
    },
    variant: {
      outline: "",
      filled: "border-transparent",
    },
    colorScheme: {
      primary: "",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
    invalid: {
      true: "border border-red-9 dark:border-reddark-9",
    },
  },
  compoundVariants: [
    // define color comobs
    {
      variant: "outline" as const,
      colorScheme: "primary" as const,
      className: "border-slate-12 dark:border-slatedark-12 text-slate-12 dark:text-slatedark-12",
    },
    {
      variant: "filled" as const,
      colorScheme: "primary" as const,
      className:
        "bg-slate-3 dark:bg-slatedark-3 data-[state=checked]:bg-slate-12 dark:data-[state=checked]:bg-slatedark-12 text-slate-1 dark:text-slatedark-1",
    },
  ],
  defaultVariants: {
    size: "md" as const,
    variant: "outline" as const,
    colorScheme: "primary" as const,
  },
};
const checkboxVariants = cva("focus-outline border peer shrink-0 rounded-sm [&>span>svg]:!stroke-2", checkboxConfig);

interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, "disabled">,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ size, variant, colorScheme, disabled, invalid, className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        checkboxVariants({ size, variant, colorScheme, disabled, invalid }),
        invalid && "border border-red-9 dark:border-reddark-9", // Need to override for outline as CVA doesn't know which style should come first.
        className,
      )}
      disabled={!!disabled}
      aria-disabled={!!disabled}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        <RiCheckFill />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ),
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
