import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "~/util/util";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-3 dark:bg-slatedark-3">
      <SliderPrimitive.Range className="absolute h-full bg-slate-12 dark:bg-slatedark-12" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="focus-outline block h-5 w-5 rounded-full border-2 border-slate-12 dark:border-slatedark-12 bg-slate-1 dark:bg-slatedark-1 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
