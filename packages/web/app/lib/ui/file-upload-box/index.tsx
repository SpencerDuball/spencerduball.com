import * as React from "react";
import { RiImageAddFill } from "react-icons/ri";
import { cn } from "~/lib/util/utils";
import { useDropArea } from "~/lib/hooks/react-use";

export interface FileUploadBoxProps extends React.ComponentProps<"div"> {}

export function FileUploadBox({ className, ...props }: FileUploadBoxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null!);

  // handle drag and drop events
  const [bind] = useDropArea({
    onFiles: (files) => {
      // get the local file url
      const localFileUrls = files.map((file) => URL.createObjectURL(file));
    },
  });

  // handle click event
  function onClick() {
    inputRef.current.click();
  }

  // setup the input onChange handler
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    // get the files
    const files = e.target.files;
    if (!files) return;

    // upload the files
    for (let file of files) {
      const localFileUrls = URL.createObjectURL(file);
      console.log(localFileUrls);
    }

    // clear the input
    e.target.value = "";
  }

  return (
    <div
      className={cn(
        "grid cursor-pointer place-items-center overflow-hidden rounded-lg border-4 border-dashed border-slateA-4 text-slateA-6",
        className,
      )}
      onClick={onClick}
      {...bind}
      {...props}
    >
      <input ref={inputRef} className="hidden" type="file" onChange={onChange} />
      <RiImageAddFill className="h-1/3 w-1/3" />
    </div>
  );
}
