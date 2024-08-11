import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { RiCircleFill } from "react-icons/ri";

import { cn } from "~/util";
import { cva, type VariantProps } from "class-variance-authority";

const radioGroupItemConfig = {
  variants: {
    size: {
      xs: "h-2 w-2",
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    },
    variant: {
      outline: "border",
      filled: "",
    },
    colorScheme: {
      primary: "border-slate-12 dark:border-slatedark-12 text-slate-12 dark:text-slatedark-12",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
    invalid: {
      true: "border border-red-9 dark:border-reddark-9",
    },
  },
  compoundVariants: [
    // define indicator sizing
    {
      variant: "outline" as const,
      size: "xs" as const,
      className: "[&>span>svg]:h-1 [&>span>svg]:w-1",
    },
    {
      variant: "outline" as const,
      size: "sm" as const,
      className: "[&>span>svg]:h-2 [&>span>svg]:w-2",
    },
    {
      variant: "outline" as const,
      size: "md" as const,
      className: "[&>span>svg]:h-2.5 [&>span>svg]:w-2.5",
    },
    {
      variant: "outline" as const,
      size: "lg" as const,
      className: "[&>span>svg]:h-3 [&>span>svg]:w-3",
    },
    {
      variant: "filled" as const,
      size: "xs" as const,
      className: "[&>span>svg]:h-1 [&>span>svg]:w-1",
    },
    {
      variant: "filled" as const,
      size: "sm" as const,
      className: "[&>span>svg]:h-1.5 [&>span>svg]:w-1.5",
    },
    {
      variant: "filled" as const,
      size: "md" as const,
      className: "[&>span>svg]:h-2 [&>span>svg]:w-2",
    },
    {
      variant: "filled" as const,
      size: "lg" as const,
      className: "[&>span>svg]:h-2.5 [&>span>svg]:w-2.5",
    },
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
const radioGroupItemVariants = cva("focus-outline aspect-square rounded-full", radioGroupItemConfig);

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

interface RadioGroupItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, "disabled">,
    VariantProps<typeof radioGroupItemVariants> {}

const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(
  ({ size, variant, colorScheme, disabled, invalid, className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          radioGroupItemVariants({ size, variant, colorScheme, disabled, invalid }),
          invalid && "border border-red-9 dark:border-reddark-9", // Need to override for outline as CVA doesn't know which style should come first.
          className,
        )}
        disabled={!!disabled}
        aria-disabled={!!disabled}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <RiCircleFill className="fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );
  },
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
