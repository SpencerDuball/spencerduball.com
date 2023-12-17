import * as React from "react";
import type { IToast, ToastTypes } from "./reducer";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/util/utils";
import { IconButton } from "~/lib/ui/button";
import { RiCloseLine } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import { ToasterCtx, Types } from ".";

/* ------------------------------------------------------------------------------------------------------------
 * Define Component Variants
 * ------------------------------------------------------------------------------------------------------------ */
// toast
const toastDefaultClasses =
  "py-3 px-4 border shadow w-80 rounded-lg grid grid-cols-[1fr_max-content] items-center bg-slate-2 border-slate-6";
const toastConfig = {
  variants: {
    type: {
      success: [],
      warning: [],
      error: [],
      info: [],
    },
  },
};
const toastVariants = cva(toastDefaultClasses.split(" "), toastConfig);

/* ------------------------------------------------------------------------------------------------------------
 * Components
 * ------------------------------------------------------------------------------------------------------------ */
export interface ToastProps extends React.ComponentPropsWithRef<"div">, Pick<IToast, "type" | "title" | "description"> {
  toastId: IToast["id"];
}
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ toastId, type, title, description, className, ...rest }, ref) => {
    const [, dispatch] = React.useContext(ToasterCtx);

    const t = type as (typeof ToastTypes)[number];
    const colors = {
      title: {
        success: "text-green-11",
        warning: "text-orange-11",
        error: "text-red-11",
        info: "text-slate-11",
      },
      description: {
        success: "text-green-12",
        warning: "text-orange-12",
        error: "text-red-12",
        info: "text-slate-12",
      },
    };

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ type: t }), className)}
        onMouseEnter={() => dispatch({ type: Types.RemoveTimer, payload: toastId })}
        onMouseLeave={() => dispatch({ type: Types.RestartTimer, payload: toastId })}
        {...rest}
      >
        {title && <p className={cn("col-span-1 col-start-1 font-semibold", colors.title[t || "info"])}>{title}</p>}
        <IconButton
          className="col-span-1 col-start-2"
          size="xs"
          variant="ghost"
          aria-label="dismiss toast"
          icon={<RiCloseLine />}
          onClick={() => dispatch({ type: Types.RemoveToast, payload: toastId })}
        />
        {description && <p className={cn(colors.description[t || "info"])}>{description}</p>}
      </div>
    );
  },
);
