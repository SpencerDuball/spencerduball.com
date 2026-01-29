import { cn } from "tailwind-variants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { isValidElement, useRef } from "react";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { Button } from "@/components/ui/button";
import { RiSidebarUnfoldLine, RiSidebarFoldLine } from "@remixicon/react";

export function MultiFence({
  scrollarea,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { scrollarea?: string }) {
  const files = React.Children.toArray(children)
    .filter(isValidElement)
    .map((child) => child.props as React.ComponentProps<typeof FenceFile>);

  const [expanded, setExpanded] = React.useState(false);

  const ref = useRef<HTMLDivElement>(null!);
  const [hasOverflow, setHasOverflow] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setHasOverflow(el.hasAttribute("data-has-overflow-y"));

    // run once on mount
    update();

    // watch for attribute changes
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ["data-has-overflow-y"] });

    return () => observer.disconnect();
  }, []);

  return (
    <Tabs defaultValue={files[0].value} className={cn("multifence", className)} {...props}>
      <div className="multifence-tab dark grid grid-flow-col items-center justify-between">
        <TabsList variant="line">
          {files.map((file, idx) => (
            <TabsTrigger key={idx} value={file.value}>
              {file.value}
            </TabsTrigger>
          ))}
        </TabsList>
        <Button
          size="icon-sm"
          variant="ghost"
          disabled={!expanded && !hasOverflow}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <RiSidebarFoldLine className="rotate-90 transform" />
          ) : (
            <RiSidebarUnfoldLine className="rotate-90 transform" />
          )}
        </Button>
      </div>
      <ScrollArea.Root ref={ref} className="h-auto w-full">
        <ScrollArea.Viewport className={cn(scrollarea, expanded && "max-h-none")}>{children}</ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="pointer-events-none m-2 flex w-1 justify-center rounded bg-(--tw-prose-pre-code)/20 opacity-0 transition-opacity data-hovering:pointer-events-auto data-hovering:opacity-100 data-hovering:delay-0 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0">
          <ScrollArea.Thumb className="w-full rounded bg-(--tw-prose-pre-code)/60" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar
          className="pointer-events-none relative flex rounded bg-(--tw-prose-pre-code)/20 opacity-0 transition-opacity before:absolute before:content-[''] data-[hovering]:pointer-events-auto data-[hovering]:opacity-100 data-[hovering]:delay-0 data-[orientation=horizontal]:m-2 data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:before:right-0 data-[orientation=horizontal]:before:-bottom-2 data-[orientation=horizontal]:before:left-0 data-[orientation=horizontal]:before:h-5 data-[orientation=horizontal]:before:w-full data-[orientation=vertical]:m-2 data-[orientation=vertical]:w-1 data-[orientation=vertical]:before:left-1/2 data-[orientation=vertical]:before:h-full data-[orientation=vertical]:before:w-5 data-[orientation=vertical]:before:-translate-x-1/2 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-0"
          orientation="horizontal"
        >
          <ScrollArea.Thumb className="w-full rounded bg-(--tw-prose-pre-code)/60" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </Tabs>
  );
}

const InFenceFile = React.createContext(false);

export function useInFenceFile() {
  return React.useContext(InFenceFile);
}

export function FenceFile({ className, ...props }: React.ComponentProps<typeof TabsContent>) {
  return (
    <InFenceFile.Provider value={true}>
      <TabsContent className={cn("fencefile", className)} {...props} />;
    </InFenceFile.Provider>
  );
}
