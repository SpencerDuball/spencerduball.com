import { cva, type VariantProps } from "class-variance-authority";
import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";
import { RiCircleFill } from "react-icons/ri";
import { cn } from "~/util";

//----------------------------------------------------------------------------------------------------------------------
// Define Component Variants
//----------------------------------------------------------------------------------------------------------------------

// InputOTP
const inputOTPDefaultClasses = "flex items-center gap-2";
const inputOTPConfig = {
  variants: {
    size: {
      xs: "",
      sm: "",
      md: "",
      lg: "",
    },
    variant: {
      outline: "",
      filled: "",
      flushed: "",
    },
    disabled: {
      true: "opacity-40 cursor-not-allowed",
    },
    invalid: {
      true: "",
    },
  },
  defaultVariants: {
    size: "md" as const,
    variant: "outline" as const,
  },
};
const inputOTPVariants = cva(inputOTPDefaultClasses, inputOTPConfig);

// InputOTPSlot
const inputOTPSlotDefaultClasses =
  "relative flex items-center justify-center border-y border-r border-slate-6 dark:border-slatedark-6 transition-all first:border-l";
const inputOTPSlotConfig = {
  variants: {
    size: {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
    },
    variant: {
      outline: "border-slate-6 dark:border-slatedark-6 first:rounded-l-md last:rounded-r-md",
      filled:
        "bg-slate-3 dark:bg-slatedark-3 border-slate-3 dark:border-slatedark-3 border-r-slate-6 dark:border-r-slatedark-6 last:border-r-slate-3 dark:last:border-r-slatedark-3 first:rounded-l-md last:rounded-r-md",
      flushed: "border-transparent border-b-slate-6 dark:border-b-slatedark-6 border-x-[3px]",
    },
    isActive: {
      true: "z-10 outline outline-[3px] outline-blue-6 dark:outline-bluedark-6",
    },
    disabled: {
      true: "opacity-95 cursor-not-allowed",
    },
    invalid: {
      true: "",
    },
  },
  compoundVariants: [
    {
      variant: "outline" as const,
      invalid: true,
      className:
        "border-y-red-9 dark:border-y-reddark-9 first:border-l-red-9 dark:first:border-l-reddark-9 last:border-r-red-9 dark:last:border-r-reddark-9",
    },
    {
      variant: "filled" as const,
      invalid: true,
      className:
        "border-y-red-9 dark:border-y-reddark-9 first:border-l-red-9 dark:first:border-l-reddark-9 last:border-r-red-9 dark:last:border-r-reddark-9",
    },
    {
      variant: "flushed" as const,
      invalid: true,
      className: "border-b-red-9 dark:border-b-reddark-9",
    },
  ],
  defaultVariants: {
    size: "md" as const,
    variant: "outline" as const,
  },
};
const inputOTPSlotVariants = cva(inputOTPSlotDefaultClasses, inputOTPSlotConfig);

//----------------------------------------------------------------------------------------------------------------------
// Define Component Context
//----------------------------------------------------------------------------------------------------------------------

// InputOTP
interface IInputOTPContext extends VariantProps<typeof inputOTPVariants> {}
const DefaultInputOTPContext: IInputOTPContext = {
  size: undefined,
  variant: undefined,
  disabled: undefined,
  invalid: undefined,
};
const InputOTPContext = React.createContext<[IInputOTPContext, React.Dispatch<React.SetStateAction<IInputOTPContext>>]>(
  [DefaultInputOTPContext, () => null],
);

//----------------------------------------------------------------------------------------------------------------------
// Define Components
//----------------------------------------------------------------------------------------------------------------------
const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput> & VariantProps<typeof inputOTPVariants>
>(({ size, variant, disabled, invalid, className, containerClassName, ...props }, ref) => {
  const [ctx, dispatch] = React.useState<IInputOTPContext>({ size, variant, disabled, invalid });

  return (
    <InputOTPContext.Provider value={[ctx, dispatch]}>
      <OTPInput
        ref={ref}
        containerClassName={inputOTPVariants({ size, variant, disabled, invalid, className: containerClassName })}
        className={cn(disabled && "cursor-not-allowed", className)}
        disabled={!!disabled}
        aria-disabled={!!disabled}
        {...props}
      />
    </InputOTPContext.Provider>
  );
});
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const [ctx] = React.useContext(InputOTPContext);
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        inputOTPSlotVariants({
          size: ctx.size,
          variant: ctx.variant,
          disabled: ctx.disabled,
          invalid: ctx.invalid,
          isActive,
        }),
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-slate-12 duration-1000 dark:bg-slatedark-12" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <RiCircleFill className="h-1.5 w-1.5" />
    </div>
  ),
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };

