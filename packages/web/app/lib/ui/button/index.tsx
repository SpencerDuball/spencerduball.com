import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "~/lib/util/utils";
import { RiLoader4Fill } from "react-icons/ri";

/* ------------------------------------------------------------------------------------------------------------
 * Define Component Variants
 * ------------------------------------------------------------------------------------------------------------ */
// Button
const buttonDefaultClasses =
  "focus-outline rounded-md relative grid grid-flow-col place-items-center gap-2 auto-cols-max justify-center";
const buttonConfig = {
  variants: {
    size: {
      xs: ["px-2", "h-6", "text-xs"],
      sm: ["px-3", "h-8", "text-sm"],
      md: ["px-4", "h-10", "text-base"],
      lg: ["px-6", "h-12", "text-lg"],
    },
    variant: {
      solid: [],
      subtle: [],
      ghost: [],
      outline: [],
    },
    colorScheme: {
      slate: [],
      red: [],
      brown: [],
      green: [],
      blue: [],
      orange: [],
    },
    isDisabled: {
      true: ["opacity-40", "cursor-not-allowed", "focus:outline-none"],
    },
    isLoading: {
      true: ["opacity-40", "cursor-not-allowed", "focus:outline-none"],
    },
    isActive: {
      true: [],
    },
  },
  compoundVariants: [
    //-----------------------------------------------------------------------------
    // Apply "slate" styles
    //-----------------------------------------------------------------------------
    // apply styles for "solid" variant
    {
      variant: "solid" as const,
      colorScheme: "slate" as const,
      className: ["bg-slate-9", "hover:bg-slate-9", "active:bg-slate-10", "text-slate-1"],
    },
    {
      variant: "solid" as const,
      colorScheme: "slate" as const,
      isDisabled: true,
      className: ["bg-slate-9", "hover:bg-slate-9", "active:bg-slate-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "slate" as const,
      isLoading: true,
      className: ["bg-slate-9", "hover:bg-slate-9", "active:bg-slate-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "slate" as const,
      isActive: true,
      className: ["bg-slate-10", "hover:bg-slate-10", "active:bg-slate-10"],
    },
    // apply styles for "subtle" variant
    {
      variant: "subtle" as const,
      colorScheme: "slate" as const,
      className: ["bg-slate-3", "hover:bg-slate-4", "active:bg-slate-5", "text-slate-9"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "slate" as const,
      isDisabled: true,
      className: ["bg-slate-3", "hover:bg-slate-3", "active:bg-slate-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "slate" as const,
      isLoading: true,
      className: ["bg-slate-3", "hover:bg-slate-3", "active:bg-slate-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "slate" as const,
      isActive: true,
      className: ["bg-slate-5", "hover:bg-slate-5", "active:bg-slate-5"],
    },
    // apply styles for "ghost" variant
    {
      variant: "ghost" as const,
      colorScheme: "slate" as const,
      className: ["hover:bg-slate-3", "active:bg-slate-4", "text-slate-9"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "slate" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "slate" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "slate" as const,
      isActive: true,
      className: ["bg-slate-4", "hover:bg-slate-4", "active:bg-slate-4"],
    },
    // apply styles for "outline" variant
    {
      variant: "outline" as const,
      colorScheme: "slate" as const,
      className: ["border", "border-slate-8", "hover:bg-slate-3", "active:bg-slate-4", "text-slate-9"],
    },
    {
      variant: "outline" as const,
      colorScheme: "slate" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "slate" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "slate" as const,
      isActive: true,
      className: ["bg-slate-4", "hover:bg-slate-4", "active:bg-slate-4"],
    },
    // copy "slate" variants to other colors ...
    //-----------------------------------------------------------------------------
    // Apply "red" styles
    //-----------------------------------------------------------------------------
    // apply styles for "solid" variant
    {
      variant: "solid" as const,
      colorScheme: "red" as const,
      className: ["bg-red-9", "hover:bg-red-9", "active:bg-red-10", "text-red-1"],
    },
    {
      variant: "solid" as const,
      colorScheme: "red" as const,
      isDisabled: true,
      className: ["bg-red-9", "hover:bg-red-9", "active:bg-red-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "red" as const,
      isLoading: true,
      className: ["bg-red-9", "hover:bg-red-9", "active:bg-red-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "red" as const,
      isActive: true,
      className: ["bg-red-10", "hover:bg-red-10", "active:bg-red-10"],
    },
    // apply styles for "subtle" variant
    {
      variant: "subtle" as const,
      colorScheme: "red" as const,
      className: ["bg-red-3", "hover:bg-red-4", "active:bg-red-5", "text-red-9"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "red" as const,
      isDisabled: true,
      className: ["bg-red-3", "hover:bg-red-3", "active:bg-red-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "red" as const,
      isLoading: true,
      className: ["bg-red-3", "hover:bg-red-3", "active:bg-red-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "red" as const,
      isActive: true,
      className: ["bg-red-5", "hover:bg-red-5", "active:bg-red-5"],
    },
    // apply styles for "ghost" variant
    {
      variant: "ghost" as const,
      colorScheme: "red" as const,
      className: ["hover:bg-red-3", "active:bg-red-4", "text-red-9"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "red" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "red" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "red" as const,
      isActive: true,
      className: ["bg-red-4", "hover:bg-red-4", "active:bg-red-4"],
    },
    // apply styles for "outline" variant
    {
      variant: "outline" as const,
      colorScheme: "red" as const,
      className: ["border", "border-red-8", "hover:bg-red-3", "active:bg-red-4", "text-red-9"],
    },
    {
      variant: "outline" as const,
      colorScheme: "red" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "red" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "red" as const,
      isActive: true,
      className: ["bg-red-4", "hover:bg-red-4", "active:bg-red-4"],
    },
    //-----------------------------------------------------------------------------
    // Apply "brown" styles
    //-----------------------------------------------------------------------------
    // apply styles for "solid" variant
    {
      variant: "solid" as const,
      colorScheme: "brown" as const,
      className: ["bg-brown-9", "hover:bg-brown-9", "active:bg-brown-10", "text-brown-1"],
    },
    {
      variant: "solid" as const,
      colorScheme: "brown" as const,
      isDisabled: true,
      className: ["bg-brown-9", "hover:bg-brown-9", "active:bg-brown-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "brown" as const,
      isLoading: true,
      className: ["bg-brown-9", "hover:bg-brown-9", "active:bg-brown-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "brown" as const,
      isActive: true,
      className: ["bg-brown-10", "hover:bg-brown-10", "active:bg-brown-10"],
    },
    // apply styles for "subtle" variant
    {
      variant: "subtle" as const,
      colorScheme: "brown" as const,
      className: ["bg-brown-3", "hover:bg-brown-4", "active:bg-brown-5", "text-brown-9"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "brown" as const,
      isDisabled: true,
      className: ["bg-brown-3", "hover:bg-brown-3", "active:bg-brown-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "brown" as const,
      isLoading: true,
      className: ["bg-brown-3", "hover:bg-brown-3", "active:bg-brown-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "brown" as const,
      isActive: true,
      className: ["bg-brown-5", "hover:bg-brown-5", "active:bg-brown-5"],
    },
    // apply styles for "ghost" variant
    {
      variant: "ghost" as const,
      colorScheme: "brown" as const,
      className: ["hover:bg-brown-3", "active:bg-brown-4", "text-brown-9"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "brown" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "brown" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "brown" as const,
      isActive: true,
      className: ["bg-brown-4", "hover:bg-brown-4", "active:bg-brown-4"],
    },
    // apply styles for "outline" variant
    {
      variant: "outline" as const,
      colorScheme: "brown" as const,
      className: ["border", "border-brown-8", "hover:bg-brown-3", "active:bg-brown-4", "text-brown-9"],
    },
    {
      variant: "outline" as const,
      colorScheme: "brown" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "brown" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "brown" as const,
      isActive: true,
      className: ["bg-brown-4", "hover:bg-brown-4", "active:bg-brown-4"],
    },

    //-----------------------------------------------------------------------------
    // Apply "green" styles
    //-----------------------------------------------------------------------------
    // apply styles for "solid" variant
    {
      variant: "solid" as const,
      colorScheme: "green" as const,
      className: ["bg-green-9", "hover:bg-green-9", "active:bg-green-10", "text-green-1"],
    },
    {
      variant: "solid" as const,
      colorScheme: "green" as const,
      isDisabled: true,
      className: ["bg-green-9", "hover:bg-green-9", "active:bg-green-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "green" as const,
      isLoading: true,
      className: ["bg-green-9", "hover:bg-green-9", "active:bg-green-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "green" as const,
      isActive: true,
      className: ["bg-green-10", "hover:bg-green-10", "active:bg-green-10"],
    },
    // apply styles for "subtle" variant
    {
      variant: "subtle" as const,
      colorScheme: "green" as const,
      className: ["bg-green-3", "hover:bg-green-4", "active:bg-green-5", "text-green-9"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "green" as const,
      isDisabled: true,
      className: ["bg-green-3", "hover:bg-green-3", "active:bg-green-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "green" as const,
      isLoading: true,
      className: ["bg-green-3", "hover:bg-green-3", "active:bg-green-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "green" as const,
      isActive: true,
      className: ["bg-green-5", "hover:bg-green-5", "active:bg-green-5"],
    },
    // apply styles for "ghost" variant
    {
      variant: "ghost" as const,
      colorScheme: "green" as const,
      className: ["hover:bg-green-3", "active:bg-green-4", "text-green-9"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "green" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "green" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "green" as const,
      isActive: true,
      className: ["bg-green-4", "hover:bg-green-4", "active:bg-green-4"],
    },
    // apply styles for "outline" variant
    {
      variant: "outline" as const,
      colorScheme: "green" as const,
      className: ["border", "border-green-8", "hover:bg-green-3", "active:bg-green-4", "text-green-9"],
    },
    {
      variant: "outline" as const,
      colorScheme: "green" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "green" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "green" as const,
      isActive: true,
      className: ["bg-green-4", "hover:bg-green-4", "active:bg-green-4"],
    },

    //-----------------------------------------------------------------------------
    // Apply "blue" styles
    //-----------------------------------------------------------------------------
    // apply styles for "solid" variant
    {
      variant: "solid" as const,
      colorScheme: "blue" as const,
      className: ["bg-blue-9", "hover:bg-blue-9", "active:bg-blue-10", "text-blue-1"],
    },
    {
      variant: "solid" as const,
      colorScheme: "blue" as const,
      isDisabled: true,
      className: ["bg-blue-9", "hover:bg-blue-9", "active:bg-blue-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "blue" as const,
      isLoading: true,
      className: ["bg-blue-9", "hover:bg-blue-9", "active:bg-blue-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "blue" as const,
      isActive: true,
      className: ["bg-blue-10", "hover:bg-blue-10", "active:bg-blue-10"],
    },
    // apply styles for "subtle" variant
    {
      variant: "subtle" as const,
      colorScheme: "blue" as const,
      className: ["bg-blue-3", "hover:bg-blue-4", "active:bg-blue-5", "text-blue-9"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "blue" as const,
      isDisabled: true,
      className: ["bg-blue-3", "hover:bg-blue-3", "active:bg-blue-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "blue" as const,
      isLoading: true,
      className: ["bg-blue-3", "hover:bg-blue-3", "active:bg-blue-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "blue" as const,
      isActive: true,
      className: ["bg-blue-5", "hover:bg-blue-5", "active:bg-blue-5"],
    },
    // apply styles for "ghost" variant
    {
      variant: "ghost" as const,
      colorScheme: "blue" as const,
      className: ["hover:bg-blue-3", "active:bg-blue-4", "text-blue-9"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "blue" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "blue" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "blue" as const,
      isActive: true,
      className: ["bg-blue-4", "hover:bg-blue-4", "active:bg-blue-4"],
    },
    // apply styles for "outline" variant
    {
      variant: "outline" as const,
      colorScheme: "blue" as const,
      className: ["border", "border-blue-8", "hover:bg-blue-3", "active:bg-blue-4", "text-blue-9"],
    },
    {
      variant: "outline" as const,
      colorScheme: "blue" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "blue" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "blue" as const,
      isActive: true,
      className: ["bg-blue-4", "hover:bg-blue-4", "active:bg-blue-4"],
    },

    //-----------------------------------------------------------------------------
    // Apply "orange" styles
    //-----------------------------------------------------------------------------
    // apply styles for "solid" variant
    {
      variant: "solid" as const,
      colorScheme: "orange" as const,
      className: ["bg-orange-9", "hover:bg-orange-9", "active:bg-orange-10", "text-orange-1"],
    },
    {
      variant: "solid" as const,
      colorScheme: "orange" as const,
      isDisabled: true,
      className: ["bg-orange-9", "hover:bg-orange-9", "active:bg-orange-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "orange" as const,
      isLoading: true,
      className: ["bg-orange-9", "hover:bg-orange-9", "active:bg-orange-9"],
    },
    {
      variant: "solid" as const,
      colorScheme: "orange" as const,
      isActive: true,
      className: ["bg-orange-10", "hover:bg-orange-10", "active:bg-orange-10"],
    },
    // apply styles for "subtle" variant
    {
      variant: "subtle" as const,
      colorScheme: "orange" as const,
      className: ["bg-orange-3", "hover:bg-orange-4", "active:bg-orange-5", "text-orange-9"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "orange" as const,
      isDisabled: true,
      className: ["bg-orange-3", "hover:bg-orange-3", "active:bg-orange-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "orange" as const,
      isLoading: true,
      className: ["bg-orange-3", "hover:bg-orange-3", "active:bg-orange-3"],
    },
    {
      variant: "subtle" as const,
      colorScheme: "orange" as const,
      isActive: true,
      className: ["bg-orange-5", "hover:bg-orange-5", "active:bg-orange-5"],
    },
    // apply styles for "ghost" variant
    {
      variant: "ghost" as const,
      colorScheme: "orange" as const,
      className: ["hover:bg-orange-3", "active:bg-orange-4", "text-orange-9"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "orange" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "orange" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "ghost" as const,
      colorScheme: "orange" as const,
      isActive: true,
      className: ["bg-orange-4", "hover:bg-orange-4", "active:bg-orange-4"],
    },
    // apply styles for "outline" variant
    {
      variant: "outline" as const,
      colorScheme: "orange" as const,
      className: ["border", "border-orange-8", "hover:bg-orange-3", "active:bg-orange-4", "text-orange-9"],
    },
    {
      variant: "outline" as const,
      colorScheme: "orange" as const,
      isDisabled: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "orange" as const,
      isLoading: true,
      className: ["hover:bg-transparent", "active:bg-transparent"],
    },
    {
      variant: "outline" as const,
      colorScheme: "orange" as const,
      isActive: true,
      className: ["bg-orange-4", "hover:bg-orange-4", "active:bg-orange-4"],
    },
  ],
  defaultVariants: {
    size: "md" as const,
    variant: "solid" as const,
    colorScheme: "slate" as const,
  },
};
export const buttonVariants = cva(buttonDefaultClasses.split(" "), buttonConfig);

// ButtonIcon
const buttonIconDefaultClasses = "";
const buttonIconConfig = {
  variants: {
    size: {
      xs: "text-sm",
      sm: "text-base",
      md: "text-lg",
      lg: "text-xl",
    },
  },
};
export const buttonIconVariants = cva(buttonIconDefaultClasses.split(" "), buttonIconConfig);

// IconButton
const iconButtonDefaultClasses = buttonDefaultClasses.split(" ").concat("grid place-items-center").join(" ");
const iconButtonConfig = {
  ...buttonConfig,
  variants: {
    ...buttonConfig.variants,
    size: {
      xs: "w-6 h-6 text-sm",
      sm: "w-8 h-8 text-base",
      md: "w-10 h-10 text-lg",
      lg: "w-12 h-12 text-xl",
    },
    isRound: {
      true: "rounded-full",
    },
  },
};
export const iconButtonVariants = cva(iconButtonDefaultClasses.split(" "), iconButtonConfig);

/* ------------------------------------------------------------------------------------------------------------
 * Components
 * ------------------------------------------------------------------------------------------------------------ */
// Button
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  loadingText?: string;
  spinner?: React.ReactElement;
  spinnerPlacement?: "left" | "right";
  asChild?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size,
      variant,
      colorScheme,
      isDisabled,
      isLoading,
      isActive,
      leftIcon,
      rightIcon,
      loadingText,
      spinner = <RiLoader4Fill />,
      spinnerPlacement = "left",
      children,
      className,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    // Apply Styles to Icons
    const Spinner = spinner
      ? React.cloneElement(spinner, {
          className: cn("animate-spin", buttonIconVariants({ size, className: spinner.props.className })),
        })
      : null;
    const LeftIcon = leftIcon
      ? React.cloneElement(leftIcon, {
          className: cn(buttonIconVariants({ size, className: leftIcon.props.className })),
        })
      : null;
    const RightIcon = rightIcon
      ? React.cloneElement(rightIcon, {
          className: cn(buttonIconVariants({ size, className: rightIcon.props.className })),
        })
      : null;

    return (
      <Comp
        disabled={!!isDisabled || !!isLoading}
        className={cn(buttonVariants({ variant, size, colorScheme, isDisabled, isLoading, isActive, className }))}
        ref={ref}
        {...props}
      >
        {isLoading && (loadingText || Spinner) ? (
          <>
            {Spinner && spinnerPlacement === "left" ? Spinner : null}
            {loadingText || null}
            {Spinner && spinnerPlacement === "right" ? Spinner : null}
          </>
        ) : (
          <>
            {LeftIcon && LeftIcon}
            {children}
            {RightIcon && RightIcon}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

// IconButton
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon: React.ReactElement;
  isRound?: boolean;
  spinner?: React.ReactElement;
  asChild?: boolean;
}
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size,
      variant,
      colorScheme,
      isDisabled,
      isLoading,
      isActive,
      icon,
      spinner = <RiLoader4Fill />,
      isRound,
      className,
      disabled,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    // Apply Styles to Icons
    const Spinner = spinner
      ? React.cloneElement(spinner, {
          className: cn("animate-spin", buttonIconVariants({ size, className: spinner.props.className })),
        })
      : null;
    const Icon = icon
      ? React.cloneElement(icon, { className: cn(buttonIconVariants({ size, className: icon.props.className })) })
      : null;

    return (
      <Comp
        disabled={!!isDisabled || !!isLoading}
        className={cn(
          iconButtonVariants({ variant, size, colorScheme, isDisabled, isLoading, isActive, isRound, className }),
        )}
        ref={ref}
        {...props}
      >
        {isLoading ? Spinner : Icon}
      </Comp>
    );
  },
);
