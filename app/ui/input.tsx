import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/util/util";

//----------------------------------------------------------------------------------------------------------------------
// Define Component Variants
//----------------------------------------------------------------------------------------------------------------------
const inputDefaultClasses = "";
const inputConfig = {
  variants: {
    size: {
      xs: "px-2 text-xs h-6",
      sm: "px-3 text-sm h-8",
      md: "px-4 text-sm h-10",
      lg: "px-4 text-base h-12",
    },
    variant: {
      outline: "focus-outline rounded-md border border-slate-6 hover:border-slate-7 bg-transparent",
      filled: "focus-outline rounded-md bg-slate-3 hover:bg-slate-4 border border-slate-3 hover:border-slate-4",
      flushed: "focus-outline border-b border-slate-6 hover:border-slate-7 bg-transparent",
    },
    disabled: {
      true: "opacity-40 cursor-not-allowed",
    },
    invalid: {
      true: "border-red-9 hover:border-red-9",
    },
  },
  compoundVariants: [
    {
      variant: "outline" as const,
      disabled: true,
      className: "hover:border-slate-6",
    },
    {
      variant: "filled" as const,
      disabled: true,
      className: "hover:bg-slate-3 hover:border-slate-3",
    },
    {
      variant: "flushed" as const,
      disabled: true,
      className: "hover:border-slate-6",
    },
  ],
  defaultVariants: {
    size: "md" as const,
    variant: "outline" as const,
  },
};
const inputVariants = cva(inputDefaultClasses, inputConfig);

const inputGroupDefaultClasses = "flex items-center [&>input]:outline-0";
const inputGroupConfig = {
  variants: {
    size: {
      xs: "px-2 text-xs h-6 gap-2",
      sm: "px-3 text-sm h-8 gap-3",
      md: "px-4 text-sm h-10 gap-4",
      lg: "px-4 text-base h-12 gap-4",
    },
    variant: {
      outline: "rounded-md border border-slate-6 hover:border-slate-7 bg-transparent",
      filled: "rounded-md bg-slate-3 hover:bg-slate-4 border border-slate-3 hover:border-slate-4",
      flushed: "border-b border-slate-6 hover:border-slate-7 bg-transparent",
    },
    disabled: {
      true: "opacity-40 cursor-not-allowed focus:outline-none",
    },
    invalid: {
      true: "border-red-9 hover:border-red-9",
    },
  },
  compoundVariants: [
    {
      variant: "outline" as const,
      disabled: true,
      className: "hover:border-slate-6",
    },
    {
      variant: "filled" as const,
      disabled: true,
      className: "hover:bg-slate-3 hover:border-slate-3",
    },
    {
      variant: "flushed" as const,
      disabled: true,
      className: "hover:border-slate-6",
    },
  ],
  defaultVariants: {
    size: "md" as const,
    variant: "outline" as const,
  },
};
const inputGroupVariants = cva(inputGroupDefaultClasses, inputGroupConfig);

//----------------------------------------------------------------------------------------------------------------------
// Define Component Context
//----------------------------------------------------------------------------------------------------------------------

// InputGroup
interface IInputGroupContext extends VariantProps<typeof inputVariants> {
  /** Available for children of the context to know if they are part of an InputGroup. */
  _isGrouped: boolean;
  /**
   * Necessary to communicate if the Input is focused. We don't wan't visual indicators on the actual Input when it is
   * part of a group. These visual indicators such as a highlight ring, should be visible on the parent InputGroup.
   */
  _isFocused: boolean;
}
const DefaultInputGroupContext: IInputGroupContext = {
  _isGrouped: false,
  _isFocused: false,
  size: undefined,
  variant: undefined,
  disabled: undefined,
  invalid: undefined,
};
const InputGroupContext = React.createContext<
  [IInputGroupContext, React.Dispatch<React.SetStateAction<IInputGroupContext>>]
>([DefaultInputGroupContext, () => null]);

//----------------------------------------------------------------------------------------------------------------------
// Define Components
//----------------------------------------------------------------------------------------------------------------------

// Input
interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "disabled">,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size, variant, disabled, invalid, onBlur, onFocus, className, ...props }, ref) => {
    const [ctx, dispatch] = React.useContext(InputGroupContext);

    // Communicate the size and variant to the context.
    React.useEffect(() => {
      if (size !== ctx.size || variant !== ctx.variant || disabled !== ctx.disabled || invalid !== ctx.invalid)
        dispatch({ ...ctx, size, variant, disabled, invalid });
    }, [size, variant]);

    return (
      <input
        ref={ref}
        className={cn(
          ctx._isGrouped ? "w-full bg-transparent outline-none" : inputVariants({ size, variant, disabled, invalid }),
          className,
        )}
        disabled={!!disabled}
        aria-disabled={!!disabled}
        onBlur={(e) => {
          dispatch && dispatch({ ...ctx, _isFocused: false });
          if (onBlur) onBlur(e);
        }}
        onFocus={(e) => {
          dispatch && dispatch({ ...ctx, _isFocused: true });
          if (onFocus) onFocus(e);
        }}
        {...props}
      />
    );
  },
);

// InputGroup
interface InputGroupProps extends React.ComponentProps<"div"> {}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(({ className, ...props }, ref) => {
  const [ctx, dispatch] = React.useState<IInputGroupContext>({ _isGrouped: true, _isFocused: false });

  return (
    <InputGroupContext.Provider value={[ctx, dispatch]}>
      <div
        ref={ref}
        className={cn(
          inputGroupVariants({
            size: ctx.size,
            variant: ctx.variant,
            disabled: ctx.disabled,
            invalid: ctx.invalid,
          }),
          ctx._isFocused && "outline outline-[3px] outline-blue-6",
          className,
        )}
        onPointerDown={(e) => {
          e.preventDefault();
          const input = e.currentTarget.getElementsByTagName("input").item(0);
          if (input) input.focus();
        }}
        {...props}
      />
    </InputGroupContext.Provider>
  );
});

export { Input, InputGroup, type InputProps, type InputGroupProps };
