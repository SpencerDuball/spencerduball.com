import { cn } from "tailwind-variants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { isValidElement } from "react";

export function MultiFence({ className, children, ...props }: React.ComponentProps<"div">) {
  const files = React.Children.toArray(children)
    .filter(isValidElement)
    .map((child) => child.props as React.ComponentProps<typeof FenceFile>);

  return (
    <Tabs defaultValue={files[0].value} className={cn("multifence", className)} {...props}>
      <TabsList variant="line" className="dark multifence-tab">
        {files.map((file, idx) => (
          <TabsTrigger key={idx} value={file.value}>
            {file.value}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export function FenceFile({ className, ...props }: React.ComponentProps<typeof TabsContent>) {
  return <TabsContent className={cn("fencefile", className)} {...props} />;
}
