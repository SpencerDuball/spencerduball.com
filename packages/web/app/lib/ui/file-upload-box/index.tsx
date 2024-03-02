import * as React from "react";
import { RiImageAddFill } from "react-icons/ri/index.js";
import { cn } from "~/lib/util/utils";
import { useDropArea } from "~/lib/hooks/react-use";

export interface FileUploadBoxProps extends React.ComponentProps<"div"> {
  /** The file upload function. */
  onFile: (file: File) => Promise<void>;
}

export function FileUploadBox({ className, onFile, ...props }: FileUploadBoxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null!);

  // create the div handlers
  const [bind] = useDropArea({ onFiles: async (files) => files.map(onFile) });
  const onClick = () => inputRef.current.click();
  const divHandlers = { onClick, ...bind };

  // setup the input handlers
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    // get the files
    const files = e.target.files;
    if (!files) return;

    // upload the files
    for (let file of files) onFile(file);

    // clear the input
    e.target.value = "";
  }
  const inputHandlers = { onChange };

  return (
    <div
      className={cn(
        "grid cursor-pointer place-items-center overflow-hidden rounded-lg border-4 border-dashed border-slateA-4 text-slateA-6",
        className,
      )}
      {...divHandlers}
      {...props}
    >
      <input ref={inputRef} className="hidden" type="file" {...inputHandlers} />
      <RiImageAddFill className="h-1/3 w-1/3" />
    </div>
  );
}
