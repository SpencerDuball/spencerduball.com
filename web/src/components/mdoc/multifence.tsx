import { cn } from "tailwind-variants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { isValidElement } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function MultiFence({
  scrollarea,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { scrollarea?: string }) {
  const files = React.Children.toArray(children)
    .filter(isValidElement)
    .map((child) => child.props as React.ComponentProps<typeof FenceFile>);

  return (
    <Tabs defaultValue={files[0].value} className={cn("multifence", className)} {...props}>
      <TabsList variant="line" className="dark">
        {files.map((file, idx) => (
          <TabsTrigger key={idx} value={file.value}>
            {file.value}
          </TabsTrigger>
        ))}
      </TabsList>
      <ScrollArea className={cn("h-auto", scrollarea)}>
        {children}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}

export function FenceFile({ className, ...props }: React.ComponentProps<typeof TabsContent>) {
  return <TabsContent className={cn("fencefile", className)} {...props} />;
}
