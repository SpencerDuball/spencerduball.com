import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { RiCircleFill } from "react-icons/ri";
import { cn } from "~/util/util";
import { cva, type VariantProps } from "class-variance-authority";

//----------------------------------------------------------------------------------------------------------------------
// Define Component Variants
//----------------------------------------------------------------------------------------------------------------------
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
};
const inputOTPVariants = cva(inputOTPDefaultClasses, inputOTPConfig);

//----------------------------------------------------------------------------------------------------------------------
// Define Component Context
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
// Define Components
//----------------------------------------------------------------------------------------------------------------------
const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  ),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-slate-6 text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 outline outline-[3px] outline-blue-6",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-slate-12 duration-1000" />
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

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
