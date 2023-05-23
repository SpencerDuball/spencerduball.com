import * as React from "react";
import { cn } from "~/lib/util";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { RiArrowDownSLine } from "react-icons/ri";
import {
  Portal,
  Select as ArkSelect,
  SelectContent as ArkSelectContent,
  SelectLabel as ArkSelectLabel,
  SelectOption as ArkSelectOption,
  SelectOptionGroup as ArkSelectOptionGroup,
  SelectOptionGroupLabel as ArkSelectOptionGroupLabel,
  SelectPositioner as ArkSelectPositioner,
  SelectTrigger as ArkSelectTrigger,
} from "@ark-ui/react";
import type {
  SelectProps as ArkSelectProps,
  SelectContentProps as ArkSelectContentProps,
  SelectLabelProps as ArkSelectLabelProps,
  SelectOptionProps as ArkSelectOptionProps,
  SelectOptionGroupProps as ArkSelectOptionGroupProps,
  SelectOptionGroupLabelProps as ArkSelectOptionGroupLabelProps,
  SelectPositionerProps as ArkSelectPositionerProps,
  SelectTriggerProps as ArkSelectTriggerProps,
} from "@ark-ui/react";
import { Button } from "~/components/ui/button";

/* ------------------------------------------------------------------------------------------------------------
 * Define Component Variants
 * ------------------------------------------------------------------------------------------------------------ */
// SelectTrigger
const selectDefaultClasses = "";
const selectConfig = {
  variants: {
    size: { xs: [], sm: [], md: [], lg: [] },
    variant: { solid: [], subtle: [], ghost: [], outline: [] },
    colorScheme: { slate: [] },
    isDisabled: { true: [] },
    isLoading: { true: [] },
    isActive: { true: [] },
  },
  compoundVariants: [],
  defaultVariants: { size: "md" as const, variant: "outline" as const, colorScheme: "slate" as const },
};
const selectVariants = cva(selectDefaultClasses.split(" "), selectConfig);

/* ------------------------------------------------------------------------------------------------------------
 * Component Context
 * ------------------------------------------------------------------------------------------------------------ */
// No context required.

/* ------------------------------------------------------------------------------------------------------------
 * Components
 * ------------------------------------------------------------------------------------------------------------ */
// Select
interface SelectProps extends Omit<ArkSelectProps, "children">, VariantProps<typeof selectVariants> {
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}
const Select = ({
  size,
  variant,
  colorScheme,
  isDisabled,
  isLoading,
  isActive,
  className,
  placeholder,
  children,
  ...props
}: SelectProps) => {
  const placeholderText = placeholder ?? "Select option";
  return (
    <ArkSelect {...props}>
      {({ selectedOption, isOpen }) => (
        <>
          <SelectTrigger>
            <Button
              size={size}
              variant={variant}
              colorScheme={colorScheme}
              isDisabled={isDisabled}
              isLoading={isLoading}
              isActive={isActive}
              className={cn(
                "grid justify-between [&>svg]:transition-transform",
                isOpen && "[&>svg]:rotate-180",
                className
              )}
              rightIcon={<RiArrowDownSLine />}
            >
              {selectedOption?.label ?? placeholderText}
            </Button>
          </SelectTrigger>
          <Portal>{children}</Portal>
        </>
      )}
    </ArkSelect>
  );
};

// SelectContent
interface SelectContentProps extends ArkSelectContentProps {}
const SelectContent = React.forwardRef<HTMLUListElement, SelectContentProps>(({ className, ...props }, ref) => {
  return (
    <ArkSelectContent
      ref={ref}
      className={cn("bg-slate-2 rounded-lg border border-slate-6 shadow p-2", className)}
      {...props}
    />
  );
});

// SelectLabel
interface SelectLabelProps extends ArkSelectLabelProps {}
const SelectLabel = React.forwardRef<HTMLLabelElement, SelectLabelProps>(({ ...props }, ref) => {
  return <ArkSelectLabel ref={ref} {...props} />;
});

// SelectOption
interface SelectOptionProps extends ArkSelectOptionProps {}
const SelectOption = React.forwardRef<HTMLLIElement, SelectOptionProps>(({ className, children, ...props }, ref) => {
  return (
    <ArkSelectOption ref={ref} className={cn("pb-2 last:pb-0", className)} {...props}>
      <Button variant="ghost" className="w-full justify-start">
        {children ?? props.label}
      </Button>
    </ArkSelectOption>
  );
});

// SelectOptionGroup
interface SelectOptionGroupProps extends ArkSelectOptionGroupProps {}
const SelectOptionGroup = React.forwardRef<HTMLDivElement, SelectOptionGroupProps>(({ ...props }, ref) => {
  return <ArkSelectOptionGroup ref={ref} {...props} />;
});

// SelectOptionGroupLabel
interface SelectOptionGroupLabelProps extends ArkSelectOptionGroupLabelProps {}
const SelectOptionGroupLabel = React.forwardRef<HTMLLabelElement, SelectOptionGroupLabelProps>(({ ...props }, ref) => {
  return <ArkSelectOptionGroupLabel ref={ref} {...props} />;
});

// SelectPositioner
interface SelectPositionerProps extends ArkSelectPositionerProps {}
const SelectPositioner = React.forwardRef<HTMLDivElement, SelectPositionerProps>(({ className, ...props }, ref) => {
  return <ArkSelectPositioner ref={ref} className={className} {...props} />;
});

// SelectTrigger
interface SelectTriggerProps extends ArkSelectTriggerProps {}
const SelectTrigger = ({ ...props }: SelectTriggerProps) => {
  return <ArkSelectTrigger {...props} />;
};

export type {
  SelectProps,
  SelectContentProps,
  SelectLabelProps,
  SelectOptionProps,
  SelectOptionGroupProps,
  SelectOptionGroupLabelProps,
  SelectPositionerProps,
  SelectTriggerProps,
};
export {
  Select,
  SelectContent,
  SelectLabel,
  SelectOption,
  SelectOptionGroup,
  SelectOptionGroupLabel,
  SelectPositioner,
  SelectTrigger,
};
