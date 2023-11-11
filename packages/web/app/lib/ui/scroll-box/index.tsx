import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { useMedia } from "~/lib/hooks/react-use";
import { cn } from "~/lib/util/client";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const isTouchScreen = useMedia("(pointer:coarse)", false);
  return (
    <ScrollAreaPrimitive.Root
      type={isTouchScreen ? "scroll" : "hover"}
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {children}
      <ScrollBar orientation="horizontal" />
      <ScrollBar orientation="vertical" />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollViewport = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Viewport ref={ref} className={cn("h-full w-full rounded-[inherit]", className)} {...props} />
));
ScrollViewport.displayName = ScrollAreaPrimitive.Viewport.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 w-full border-t border-t-transparent p-[1px] flex-col",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className='relative flex-1 rounded-full bg-slateA-10 before:content-[""] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 w-full h-full' />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollViewport };
