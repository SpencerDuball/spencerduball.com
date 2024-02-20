import * as React from "react";
import { RiImageAddFill } from "react-icons/ri";
import { cn } from "~/lib/util/utils";

export interface FileUploadBoxProps extends React.ComponentProps<"div"> {}

export function FileUploadBox({ className, ...props }: FileUploadBoxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null!);

  // handle drag and drop events
  function handleDragOverEvent(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }
  function handleDropEvent(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    console.log({ files });
  }

  return (
    <div
      className={cn(
        "grid cursor-pointer place-items-center overflow-hidden rounded-lg border-4 border-dashed border-slateA-4 text-slateA-6",
        className,
      )}
      onDragOver={handleDragOverEvent}
      onDrop={handleDropEvent}
      {...props}
    >
      <input ref={inputRef} className="hidden" type="file" />
      <RiImageAddFill className="h-1/3 w-1/3" />
    </div>
  );
}
