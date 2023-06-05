import * as React from "react";
import { RiImageAddFill } from "react-icons/ri";
import { cn } from "~/lib/util";
import { useDropArea, useMeasure } from "react-use";
import { CmsEditorCtx } from "~/components/app/cms-editor-ctx";
import { AttachmentLi } from "~/components/app/attachment-li";
import { ScrollArea, ScrollViewport } from "~/components/ui/scroll-box";

/* ------------------------------------------------------------------------------------------------------------
 * Define Attachments UploadBox
 * ------------------------------------------------------------------------------------------------------------ */
interface IFileUploadBox extends React.ComponentProps<"div"> {}

function FileUploadBox({ className, ...rest }: IFileUploadBox) {
  const inputRef = React.useRef<HTMLInputElement>(null!);
  const [state] = React.useContext(CmsEditorCtx);

  // setup the droparea handlers
  const [bond] = useDropArea({
    onFiles: (files) => files.forEach((file) => state.server?.attachment.upload(file).then(({ upload }) => upload())),
  });
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => inputRef?.current?.click();
  const dropareaHandlers = { ...bond, onClick };

  // setup the input handlers
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target?.files ? Array.from(e.target.files) : [];
    files.forEach((file) => state.server?.attachment.upload(file).then(({ upload }) => upload()));
    e.target.value = "";
  }
  const inputHandlers = { onChange };

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden border-dashed border-4 border-slateA-4 text-slateA-6 cursor-pointer grid place-items-center",
        className
      )}
      {...dropareaHandlers}
      {...rest}
    >
      <input ref={inputRef} className="hidden" type="file" {...inputHandlers} />
      <RiImageAddFill className="h-1/3 w-1/3" />
    </div>
  );
}

export default function Attachments() {
  const [state] = React.useContext(CmsEditorCtx);
  const [containerRef, { height, width }] = useMeasure<HTMLDivElement>();

  if (state.data.attachments.length === 0) {
    return (
      <div className="grid place-items-center h-full w-full">
        <FileUploadBox className="w-full h-full max-h-[32rem] max-w-[32rem]" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("h-full overflow-hidden")}>
      <ScrollArea style={{ height: `${height}px`, width: `${width}px` }}>
        <ScrollViewport>
          <div className="grid h-min grid-cols-1 sm:grid-cols-2 gap-4 content-start auto-rows-fr py-6">
            {state.data.attachments
              .sort((prev, next) => prev.created_at.getTime() - next.created_at.getTime())
              .map((a) => (
                <AttachmentLi key={a.id} attachment={a} />
              ))}
            <FileUploadBox className="w-full" />
          </div>
        </ScrollViewport>
      </ScrollArea>
    </div>
  );
}
