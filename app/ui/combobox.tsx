import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "./command";
import { cn } from "~/util/util";
import { RiExpandUpDownLine, RiCheckLine } from "react-icons/ri";

//---------------------------------------------------------------------------------------------------------------------
// Define ComboBoxCtx, InitialState
//---------------------------------------------------------------------------------------------------------------------
// define initial ComboBoxCtxState
interface IComboBoxCtxState {
  value: string;
  isValueCtrld: boolean;
  open: boolean;
  isOpenCtrld: boolean;
  isDisabled: boolean;
  isRequired: boolean;
}
const InitialComboBoxCtxState: IComboBoxCtxState = {
  value: "",
  isValueCtrld: false,
  open: false,
  isOpenCtrld: false,
  isDisabled: false,
  isRequired: false,
};

// create ComboBoxCtx
const ComboBoxCtx = React.createContext<[IComboBoxCtxState, React.Dispatch<React.SetStateAction<IComboBoxCtxState>>]>([
  InitialComboBoxCtxState,
  () => null,
]);

//---------------------------------------------------------------------------------------------------------------------
// Define ComboBox Components
//---------------------------------------------------------------------------------------------------------------------
interface ComboBoxProps extends Omit<React.ComponentPropsWithoutRef<typeof Popover>, "modal" | "dir"> {
  /** The value of the select when initially rendered. Use when you do not need to control the state of the select. */
  defaultValue?: string;
  /** The controlled value of the select. Should be used in conjunction with `onValueChange`. */
  value?: string;
  /** Event handler called when the value changes. */
  onValueChange?: (value: string) => void;
  /** The open state of the select when it is initially rendered. Use when you do not need to control the open state. */
  defaultOpen?: boolean;
  /** The controlled open state of the select. Must be used in conjunction with `onOpenChange`. */
  open?: boolean;
  /** The name of the select. Submitted with it's owning form as part of a name/value pair. */
  name?: string;
  /** When `true`, prevents the user from interacting with select. */
  disabled?: boolean;
  /** When `true`, indicates that the user must select a value before the owning form can be submitted. */
  required?: boolean;
}

function ComboBox({
  // Popover & ComboBox Props
  open,
  defaultOpen,
  onOpenChange,
  // ComboBox Props
  defaultValue,
  value,
  onValueChange,
  name,
  disabled,
  required,
  // ...
  ...props
}: ComboBoxProps) {
  const [state, setState] = React.useState({
    value: value ?? defaultValue ?? "",
    isValueCtrld: value !== undefined,
    open: open ?? defaultOpen ?? false,
    isOpenCtrld: open !== undefined,
    isDisabled: disabled ?? false,
    isRequired: required ?? false,
  });

  // If controlled value or open, handle when it's updated here.
  React.useEffect(() => {
    if (value && value !== state.value) setState({ ...state, value });
    if (open && open !== state.open) setState({ ...state, open });
  }, [value, open]);

  // define default onOpenChange
  const defaultOnOpenChange = (open: boolean) => setState({ ...state, open });

  return (
    <ComboBoxCtx.Provider value={[state, setState]}>
      <Popover open={state.open} onOpenChange={onOpenChange ?? defaultOnOpenChange} modal={false} {...props} />
    </ComboBoxCtx.Provider>
  );
}

const ComboBoxTrigger = PopoverTrigger;

interface ComboBoxValueProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "children"> {
  placeholder: string;
}
const ComboBoxValue = React.forwardRef<React.ElementRef<typeof Button>, ComboBoxValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const [state] = React.useContext(ComboBoxCtx);
    return (
      <Button
        ref={ref}
        value={state.value}
        disabled={state.isDisabled}
        aria-required={state.isRequired}
        variant="outline"
        role="combobox"
        className={cn("justify-between", className)}
        {...props}
      >
        {!state.value ? placeholder : state.value}
        <RiExpandUpDownLine className="shink-0 ml-2 h-4 w-4 opacity-50" />
      </Button>
    );
  },
);

const ComboBoxContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ children, className, ...props }, ref) => {
  return (
    <PopoverContent ref={ref} className={cn("p-0", className)} {...props}>
      <Command>
        <CommandInput placeholder="Search ..." />
        <CommandEmpty>No matches found.</CommandEmpty>
        {children}
      </Command>
    </PopoverContent>
  );
});

const ComboBoxGroup = CommandGroup;

const ComboBoxItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem> & { value: string }
>(({ value, children, onSelect, ...props }, ref) => {
  const [state, setState] = React.useContext(ComboBoxCtx);

  function newValue(value: string) {
    if (state.isValueCtrld) return state.value;
    else if (state.value === value) return "";
    else return value;
  }

  return (
    <CommandItem
      ref={ref}
      value={value}
      onSelect={(value: any) => {
        if (!state.isValueCtrld || !state.isOpenCtrld)
          setState({
            ...state,
            value: newValue(value),
            open: state.isOpenCtrld ? state.open : false,
          });
      }}
      {...props}
    >
      <RiCheckLine className={cn("mr-2 h-4 w-4", state.value === value ? "opacity-100" : "opacity-0")} />
      {children}
    </CommandItem>
  );
});

const ComboBoxSeparator = CommandSeparator;

export {
  ComboBox,
  ComboBoxTrigger,
  ComboBoxValue,
  ComboBoxContent,
  ComboBoxGroup,
  ComboBoxItem,
  ComboBoxSeparator,
  type ComboBoxProps,
  type ComboBoxValueProps,
};
