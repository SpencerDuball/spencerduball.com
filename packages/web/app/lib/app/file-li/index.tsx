import * as React from "react";
import { cn } from "~/lib/util/utils";
import { IBlogFile } from "~/model/blogs";
import { IconButton } from "~/lib/ui/button";
import {
  RiCheckLine,
  RiClipboardLine,
  RiCloseLine,
  RiFileInfoLine,
  RiExternalLinkFill,
  RiDownload2Fill,
  RiDeleteBin2Fill,
} from "react-icons/ri/index.js";
import * as Dialog from "@radix-ui/react-dialog";
import { FetcherWithComponents, useFetcher } from "@remix-run/react";
// @ts-ignore
import ms from "ms"; // TODO: This package has types that aren't defined correctly when using "Bundler" module resolution strategy.

/**
 * Input size in bytes, get a human-readable file string.
 */
function humanFileSize(size: number) {
  let i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return Number((size / Math.pow(1024, i)).toFixed(2)) * 1 + " " + ["B", "kB", "MB", "GB", "TB"][i];
}

// --------------------------------------------------------------------------------------------------------------------
// ProgressRing
// ------------
// A progress ring for tracking an upload.
// --------------------------------------------------------------------------------------------------------------------
interface ProgressRingProps extends React.ComponentProps<"div"> {
  percent: number;
}
function ProgressRing({ percent, className, ...props }: ProgressRingProps) {
  const ref = React.useRef<SVGCircleElement>(null!);

  const [radius, setRadius] = React.useState(0);
  React.useEffect(() => {
    if (ref.current) setRadius(ref.current?.r.baseVal.value ?? 0);
  });
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn("aspect-square w-1/2", className)} {...props}>
      <svg className="h-full w-full" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          className="h-full w-full stroke-slateLight-6"
          cx="50%"
          cy="50%"
          r="calc(50% - 4px)"
          fill="none"
          strokeWidth="4"
        />
        {/* Foreground Circle */}
        <circle
          ref={ref}
          className="h-full w-full stroke-blueLight-11"
          cx="50%"
          cy="50%"
          r="calc(50% - 4px)"
          fill="none"
          strokeWidth="4"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - (percent / 100) * circumference}
        />
        {/* Centered Text */}
        <text x="50%" y="50%" textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-slateLight-6">
          <tspan>{percent}%</tspan>
          <tspan x="50%" dy="12">
            Uploading
          </tspan>
        </text>
      </svg>
    </div>
  );
}

// --------------------------------------------------------------------------------------------------------------------
// FileLiDialog
// ------------
// The file list item dialog.
// --------------------------------------------------------------------------------------------------------------------

interface DialogContentProps extends Dialog.DialogContentProps {
  data: IBlogFile;
  remove: FetcherWithComponents<any>;
}

const DialogContent = React.forwardRef<React.ElementRef<typeof Dialog.Content>, DialogContentProps>(
  ({ data, remove, className, ...props }, ref) => {
    return (
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2  duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "grid w-[calc(100dvw-theme(spacing.8))] max-w-lg overflow-clip rounded-lg border border-slate-6 bg-slate-1 shadow-lg",
        )}
        {...props}
      >
        {/* Heading */}
        <div className="space-between grid grid-flow-col grid-cols-[1fr_max-content] border-b border-b-slate-6 bg-slate-2 p-4">
          <h1 className="overflow-hidden overflow-ellipsis text-nowrap text-lg font-bold">{data.name}</h1>
          <Dialog.Close asChild>
            <IconButton variant="subtle" size="xs" aria-label="Close" icon={<RiCloseLine />} />
          </Dialog.Close>
        </div>
        {/* Content */}
        <div className="grid gap-4 p-4">
          <div className="grid grid-flow-col gap-4">
            <div className="grid gap-1">
              <p className="px-2 text-xs font-medium text-slate-11">SIZE</p>
              <p className="sm:text-md cursor-not-allowed overflow-hidden overflow-ellipsis text-nowrap rounded-md bg-slate-3 px-2 py-1 text-sm text-slate-12">
                {humanFileSize(data.size)}
              </p>
            </div>
            <div className="grid gap-1">
              <p className="px-2 text-xs font-medium text-slate-11">TYPE</p>
              <p className="sm:text-md cursor-not-allowed overflow-hidden overflow-ellipsis text-nowrap rounded-md bg-slate-3 px-2 py-1 text-sm text-slate-12">
                {data.type}
              </p>
            </div>
            <div className="grid gap-1">
              <p className="px-2 text-xs font-medium text-slate-11">CREATED</p>
              <p className="sm:text-md cursor-not-allowed overflow-hidden overflow-ellipsis text-nowrap rounded-md bg-slate-3 px-2 py-1 text-sm text-slate-12">
                {data.created_at.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-flow-col gap-2 p-4 pt-0 sm:justify-end [&_button]:w-full sm:[&_button]:w-20">
          <a target="_blank" href={data.url}>
            <IconButton variant="subtle" aria-label="Open link in another tab." icon={<RiExternalLinkFill />} />
          </a>
          {/* Note that the `download` attribute will only work on origins with the same host, so on localhost this
              will not work correcty.
              https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download
          */}
          <a target="_blank" href={data.url} download>
            <IconButton variant="subtle" aria-label="Download the file." icon={<RiDownload2Fill />} />
          </a>
          <remove.Form method="DELETE" action={`/blog/${data.blog_id}/file/${data.id}`}>
            <IconButton type="submit" colorScheme="red" aria-label="Delete the file." icon={<RiDeleteBin2Fill />} />
          </remove.Form>
        </div>
      </Dialog.Content>
    );
  },
);

// --------------------------------------------------------------------------------------------------------------------
// FileLi
// ------
// The file list item.
// --------------------------------------------------------------------------------------------------------------------

export interface FileLiProps extends React.ComponentProps<"li"> {
  data: IBlogFile;
  uploadPercent?: number;
}

export function FileLi({ data, uploadPercent, className, ...props }: FileLiProps) {
  // add logic for the copy button
  const [copy, setCopy] = React.useState({ copied: false, timeoutId: -1 });
  async function onCopy() {
    if (copy.timeoutId > 0) window.clearTimeout(copy.timeoutId);
    await navigator.clipboard.writeText(data.url);
    const timeoutId = window.setTimeout(() => setCopy({ ...copy, copied: false }), 2000);
    setCopy({ copied: true, timeoutId });
  }

  // add logic for the remove button & dialog
  const [open, setOpen] = React.useState(false);
  const remove = useFetcher();
  React.useEffect(() => {
    if (remove.state !== "idle" && open) setOpen(false);
  }, [remove.state]);

  return (
    <Dialog.Root open={open} onOpenChange={(open) => setOpen(open)}>
      <li
        className={cn(
          "relative grid aspect-square w-full gap-3 overflow-hidden rounded-xl",
          remove.state !== "idle" && "hidden",
          className,
        )}
        {...props}
      >
        {/* Background Image */}
        <img
          className="col-start-1 row-start-1 aspect-square h-full w-full object-cover"
          src={data.url}
          alt={`Upload file ${data.name}.`}
        />
        <div className="col-start-1 row-start-1 h-full w-full bg-gradient-to-t from-black/40 to-transparent" />
        {/* Actual Content */}
        <div className="col-start-1 row-start-1 grid p-4">
          {/* Top Buttons */}
          <div className="grid grid-flow-col justify-between">
            <Dialog.Trigger asChild>
              <IconButton
                isRound
                variant="solid"
                className="bg-slateALight-3 text-slateLight-1 hover:bg-slateALight-4 focus:outline-blueLight-6 active:bg-slateALight-5"
                aria-label="Edit file info."
                icon={<RiFileInfoLine />}
              />
            </Dialog.Trigger>
            <IconButton
              isRound
              variant="solid"
              className="bg-slateALight-3 text-slateLight-1 hover:bg-slateALight-4 focus:outline-blueLight-6 active:bg-slateALight-5"
              aria-label="Copy markdown to clipboard."
              icon={copy.copied ? <RiCheckLine /> : <RiClipboardLine />}
              onClick={onCopy}
            />
          </div>
          {/* Bottom Info */}
          <div className="grid content-end gap-0.5">
            <div className="grid grid-flow-col grid-cols-[max-content] gap-1">
              <div className="w-max rounded-full bg-purple-9 px-2.5 py-0.5 text-xs font-medium text-slateLight-1">
                {humanFileSize(data.size)}
              </div>
              {data.expires_at && (
                <div className="w-max rounded-full bg-orange-9 px-2.5 py-0.5 text-xs font-medium text-slateLight-1">
                  {ms(data.expires_at.getTime() - Date.now())} Left
                </div>
              )}
            </div>
            <div className="overflow-hidden overflow-ellipsis text-nowrap text-lg font-semibold text-slateLight-1">
              {data.name}
            </div>
            <div className="text-sm font-medium text-slateLight-2">
              {data.created_at.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
        {/* Loading Indicator */}
        {uploadPercent !== undefined && (
          <div className="absolute left-0 top-0 grid h-full w-full place-items-center bg-black/30">
            <ProgressRing percent={uploadPercent} />
          </div>
        )}
      </li>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent data={data} remove={remove} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
