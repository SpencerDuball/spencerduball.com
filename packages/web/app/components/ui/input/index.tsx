import * as React from "react";
import { cn } from "~/lib/util";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

/* ------------------------------------------------------------------------------------------------------------
 * Define Component Variants
 * ------------------------------------------------------------------------------------------------------------ */
// Input
const inputDefaultClasses = "";
const inputConfig = {
  variants: {
    size: {
      xs: ["px-2 text-xs h-6"],
      sm: ["px-3 text-sm h-8"],
      md: ["px-4 text-md h-10"],
      lg: ["px-4 text-lg h-12"],
    },
    variant: {
      outline: ["focus-outline", "rounded-md", "border", "border-slate-7", "hover:border-slate-8", "bg-transparent"],
      filled: ["focus-outline", "rounded-md", "bg-slate-3", "hover:bg-slate-4", "focus:bg-transparent"],
      flushed: [
        "focus:outline-0",
        "bg-transparent",
        "border-b",
        "border-slate-7",
        "focus:border-b-[3px]",
        "focus:border-blue-6",
      ],
    },
  },
  compoundVariants: [
    {
      variant: "outline" as const,
      size: "xs" as const,
      className: ["px-[calc(2rem - 1px)]", "h-[calc(6rem - 1px)]"],
    },
    {
      variant: "outline" as const,
      size: "sm" as const,
      className: ["px-[calc(3rem - 1px)]", "h-[calc(8rem - 1px)]"],
    },
    {
      variant: "outline" as const,
      size: "md" as const,
      className: ["px-[calc(4rem - 1px)]", "h-[calc(10rem - 1px)]"],
    },
    {
      variant: "outline" as const,
      size: "lg" as const,
      className: ["px-[calc(6rem - 1px)]", "h-[calc(12rem - 1px)]"],
    },
  ],
  defaultVariants: {
    size: "md" as const,
    variant: "outline" as const,
  },
};
const inputVariants = cva(inputDefaultClasses.split(" "), inputConfig);

// InputGroup
const inputGroupDefaultClasses = "flex items-center [&>input]:outline-0 [&>input]:bg-transparent";
const inputGroupConfig = {
  variants: {
    size: {
      xs: [...inputConfig.variants.size.xs, "gap-2"],
      sm: [...inputConfig.variants.size.sm, "gap-3"],
      md: [...inputConfig.variants.size.md, "gap-4"],
      lg: [...inputConfig.variants.size.lg, "gap-4"],
    },
    variant: {
      outline: inputConfig.variants.variant.outline.filter((cls) => !["focus-outline"].includes(cls)),
      filled: inputConfig.variants.variant.filled.filter((cls) => !["focus-outline"].includes(cls)),
      flushed: inputConfig.variants.variant.flushed.filter(
        (cls) => !["focus:border-b-[3px]", "focus:border-blue-6"].includes(cls)
      ),
    },
  },
  defaultVariants: {
    size: "md" as const,
    variant: "outline" as const,
  },
};
const inputGroupVariants = cva(inputGroupDefaultClasses.split(" "), inputGroupConfig);

/* ------------------------------------------------------------------------------------------------------------
 * Component Context
 * ------------------------------------------------------------------------------------------------------------ */
// InputGroup
interface IInputGroupContext extends VariantProps<typeof inputVariants> {
  _isGrouped: true | undefined;
  isFocused: true | undefined;
}
const DefaultInputGroupContext: IInputGroupContext = {
  _isGrouped: true,
  isFocused: undefined,
  size: undefined,
  variant: undefined,
};
const InputGroupContext = React.createContext<{
  state: IInputGroupContext;
  dispatch: React.Dispatch<React.SetStateAction<IInputGroupContext>>;
}>(null!);

/* ------------------------------------------------------------------------------------------------------------
 * Components
 * ------------------------------------------------------------------------------------------------------------ */
// Input
interface InputProps extends Omit<React.ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size, variant, className, onBlur, onFocus, ...props }, ref) => {
    const ctx = React.useContext(InputGroupContext);
    const { state: group, dispatch } = ctx ? ctx : { state: DefaultInputGroupContext, dispatch: null };

    // When the input is part of a InputGroup, we don't want to apply styles to the input element itself,
    // these styles will be applied to the InputGroup.
    const classes = group._isGrouped
      ? cn("w-full outline-none", className)
      : cn(inputVariants({ size: size || group.size, variant: variant || group.variant, className }));

    return (
      <input
        ref={ref}
        className={classes}
        onBlur={(e) => {
          dispatch && dispatch({ ...group, isFocused: undefined });
          if (onBlur) onBlur(e);
        }}
        onFocus={(e) => {
          dispatch && dispatch({ ...group, isFocused: true });
          if (onFocus) onFocus(e);
        }}
        {...props}
      />
    );
  }
);

// InputLeftElement
interface InputLeftElementProps extends React.ComponentProps<"div"> {}
const InputLeftElement = React.forwardRef<HTMLDivElement, InputLeftElementProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn(className)} {...props} />;
});

// InputRightElement
interface InputRightElementProps extends React.ComponentProps<"div"> {}
const InputRightElement = React.forwardRef<HTMLDivElement, InputRightElementProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn(className)} {...props} />;
});

// InputGroup
interface InputGroupProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputGroupVariants> {}
const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ size, variant, className, children, ...props }, ref) => {
    const [state, dispatch] = React.useState<IInputGroupContext>(DefaultInputGroupContext);

    // parse the children
    let inputLeftElement: React.ReactElement | null = null;
    let input: React.ReactElement | null = null;
    let inputRightElement: React.ReactElement | null = null;
    React.Children.forEach(children, (child, idx) => {
      // get the child props
      if (!React.isValidElement(child)) return null;
      const { className, ...rest } = child.props;

      // collect the parts
      if (child.type === Input) {
        if (!input) input = child;
        else console.error("The 'InputGroup' may only have 1 'Input' child.");
      } else if (child.type === InputLeftElement) {
        if (!inputLeftElement) inputLeftElement = child;
        else console.error("The 'InputGroup' may only have 1 'InputLeftElement' child.");
      } else if (child.type === InputRightElement) {
        if (!inputRightElement) inputRightElement = child;
        else console.error("The 'InputGroup' may only have 1 'InputRightElement' child.");
      }
    });

    // ensure required parts exist
    if (!input) throw new Error("The 'InputGroup' must have an 'Input' element.");

    // capture the focus styles
    const focusStyles = state.isFocused
      ? variant === "flushed"
        ? "outline-0 outline-[3px] outline-blue-6"
        : "outline-blue-6 outline outline-[3px]"
      : "";

    return (
      <InputGroupContext.Provider value={{ state, dispatch }}>
        <div ref={ref} className={cn(focusStyles, inputGroupVariants({ size, variant, className }))} {...props}>
          {inputLeftElement}
          {input}
          {inputRightElement}
        </div>
      </InputGroupContext.Provider>
    );
  }
);

export type { InputProps, InputGroupProps, InputLeftElementProps, InputRightElementProps };
export { Input, InputGroup, InputLeftElement, InputRightElement };
