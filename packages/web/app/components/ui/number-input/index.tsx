import * as React from "react";
import { cn } from "~/lib/util";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import {
  NumberInput as ArkNumberInput,
  NumberInputControl as ArkNumberInputControl,
  NumberInputDecrementTrigger as ArkNumberInputDecrementTrigger,
  NumberInputField as ArkNumberInputField,
  NumberInputIncrementTrigger as ArkNumberInputIncrementTrigger,
  NumberInputScrubber as ArkNumberInputScrubber,
} from "@ark-ui/react";
import type {
  NumberInputProps as ArkNumberInputProps,
  NumberInputControlProps as ArkNumberInputControlProps,
  NumberInputDecrementTriggerProps as ArkNumberInputDecrementTriggerProps,
  NumberInputFieldProps as ArkNumberInputFieldProps,
  NumberInputIncrementTriggerProps as ArkNumberInputIncrementTriggerProps,
  NumberInputScrubberProps as ArkNumberInputScrubberProps,
} from "@ark-ui/react";
import { RiSubtractLine, RiAddLine } from "react-icons/ri";

/* ------------------------------------------------------------------------------------------------------------
 * Define Component Variants
 * ------------------------------------------------------------------------------------------------------------ */
// NumberInput
const numberInputDefaultClasses = "grid grid-flow-col [&>input]:outline-0 [&>input]:bg-transparent overflow-hidden";
const numberInputConfig = {
  variants: {
    size: {
      xs: [],
      sm: [],
      md: [],
      lg: [],
    },
    variant: {
      outline: ["rounded-md", "border", "border-slate-7", "hover:border-slate-8", "bg-transparent"],
      filled: ["rounded-md", "bg-slate-3", "hover:bg-slate-4", "focus:bg-transparent"],
      flushed: ["bg-transparent", "border-b", "border-slate-7"],
    },
  },
  compoundVariants: [],
  defaultVariants: {
    size: "md" as const,
    variant: "outline" as const,
  },
};
const numberInputVariants = cva(numberInputDefaultClasses.split(" "), numberInputConfig);

// NumberInputField
const numberInputFieldDefaultClasses = "w-full";
const numberInputFieldConfig = {
  variants: {
    size: {
      xs: ["px-2 text-xs h-6"],
      sm: ["px-3 text-sm h-8"],
      md: ["px-4 text-md h-10"],
      lg: ["px-4 text-lg h-12"],
    },
    variant: {
      outline: [],
      filled: [],
      flushed: [],
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
const numberInputFieldVariants = cva(numberInputFieldDefaultClasses.split(" "), numberInputFieldConfig);

// NumberInputControl
const numberInputControlDefaultClasses = "grid border-l border-slate-7 w-6";
const numberInputControlConfig = {
  variants: {
    size: {
      xs: [],
      sm: [],
      md: [],
      lg: [],
    },
  },
  defaultVariants: {
    size: "md" as const,
  },
};
const numberInputControlVariants = cva(numberInputControlDefaultClasses.split(" "), numberInputControlConfig);

/* ------------------------------------------------------------------------------------------------------------
 * Component Context
 * ------------------------------------------------------------------------------------------------------------ */
// NumberInput
interface INumberInputContext extends VariantProps<typeof numberInputVariants> {
  isFocused: true | undefined;
}
const DefaultNumberInputContext: INumberInputContext = {
  isFocused: undefined,
  size: undefined,
  variant: undefined,
};
const NumberInputContext = React.createContext<{
  state: INumberInputContext;
  dispatch: React.Dispatch<React.SetStateAction<INumberInputContext>>;
}>(null!);

/* ------------------------------------------------------------------------------------------------------------
 * Components
 * ------------------------------------------------------------------------------------------------------------ */
// NumberInput
interface NumberInputProps extends ArkNumberInputProps, VariantProps<typeof numberInputVariants> {}
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ size, variant, className, ...props }, ref) => {
    const [state, dispatch] = React.useState<INumberInputContext>(DefaultNumberInputContext);

    // capture focus styles
    const focusStyles = state.isFocused
      ? variant === "flushed"
        ? "outline-0 outline-[3px] outline-blue-6"
        : "outline-blue-6 outline outline-[3px]"
      : "";

    return (
      <NumberInputContext.Provider value={{ state, dispatch }}>
        <ArkNumberInput
          ref={ref}
          className={cn(focusStyles, numberInputVariants({ size, variant, className }))}
          {...props}
        />
      </NumberInputContext.Provider>
    );
  }
);

// NumberInputScrubber
interface NumberInputScrubberProps extends ArkNumberInputScrubberProps {}
const NumberInputScrubber = React.forwardRef<HTMLInputElement, NumberInputScrubberProps>(
  ({ className, ...props }, ref) => {
    return <ArkNumberInputScrubber ref={ref} className={className} {...props} />;
  }
);

// NumberInputControl
interface NumberInputControlProps extends ArkNumberInputControlProps, VariantProps<typeof numberInputControlVariants> {}
const NumberInputControl = React.forwardRef<HTMLInputElement, NumberInputControlProps>(
  ({ size, className, ...props }, ref) => {
    const { state: group } = React.useContext(NumberInputContext);
    return (
      <ArkNumberInputControl
        ref={ref}
        className={cn(numberInputControlVariants({ size: size || group.size, className }))}
        {...props}
      />
    );
  }
);

// NumberInputDecrementTrigger
interface NumberInputDecrementTriggerProps extends Omit<ArkNumberInputDecrementTriggerProps, "children"> {}
const NumberInputDecrementTrigger = ({ ...props }: NumberInputDecrementTriggerProps) => {
  return (
    <ArkNumberInputDecrementTrigger {...props}>
      <button className="grid place-items-center h-full w-full first:border-b border-slate-7 hover:bg-slateA-5 active:bg-slateA-6">
        <RiSubtractLine />
      </button>
    </ArkNumberInputDecrementTrigger>
  );
};

// NumberInputIncrementTrigger
interface NumberInputIncrementTriggerProps extends Omit<ArkNumberInputIncrementTriggerProps, "children"> {}
const NumberInputIncrementTrigger = ({ ...props }: NumberInputIncrementTriggerProps) => {
  return (
    <ArkNumberInputIncrementTrigger {...props}>
      <button className="grid place-items-center h-full w-full first:border-b border-slate-7 hover:bg-slateA-5 active:bg-slateA-6">
        <RiAddLine />
      </button>
    </ArkNumberInputIncrementTrigger>
  );
};

// NumberInputFieldProps
interface NumberInputFieldProps
  extends Omit<ArkNumberInputFieldProps, "size">,
    VariantProps<typeof numberInputFieldVariants> {}
const NumberInputField = React.forwardRef<HTMLInputElement, NumberInputFieldProps>(
  ({ size, variant, className, onBlur, onFocus, ...props }, ref) => {
    const { state: group, dispatch } = React.useContext(NumberInputContext);
    return (
      <ArkNumberInputField
        ref={ref}
        className={cn(
          numberInputFieldVariants({ size: size || group.size, variant: variant || group.variant, className })
        )}
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

export {
  NumberInput,
  NumberInputScrubber,
  NumberInputControl,
  NumberInputDecrementTrigger,
  NumberInputIncrementTrigger,
  NumberInputField,
};
export type {
  NumberInputProps,
  NumberInputScrubberProps,
  NumberInputControlProps,
  NumberInputDecrementTriggerProps,
  NumberInputIncrementTriggerProps,
  NumberInputFieldProps,
};
