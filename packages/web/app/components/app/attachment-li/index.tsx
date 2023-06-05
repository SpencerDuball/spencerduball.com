import * as React from "react";
import { IAttachment, humanFileSize } from "~/model/attachment";
import { cn } from "~/lib/util";
import ReactPlayer from "react-player";
import { IconButton, Button } from "~/components/ui/button";
import { RiDeleteBin6Line, RiShareBoxLine, RiClipboardLine, RiAlertFill } from "react-icons/ri";
import * as Popover from "@radix-ui/react-popover";
import { Link, useFetcher } from "@remix-run/react";
import {
  Dialog,
  DialogTrigger,
  Portal,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogCloseTrigger,
} from "@ark-ui/react";
import { CmsEditorCtx, Types } from "~/components/app/cms-editor-ctx";

function daysRemaining(expires_at: Date) {
  return Math.ceil((expires_at.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
}

export interface AttachmentLiProps extends React.ComponentProps<"li"> {
  attachment: IAttachment;
}

export function AttachmentLi({ className, attachment, ...rest }: AttachmentLiProps) {
  // control popover
  const [popover, setPopover] = React.useState<{ open: boolean }>({ open: false });
  const remove = useFetcher();
  const [ctx, dispatch] = React.useContext(CmsEditorCtx);

  React.useEffect(() => {
    if (remove.state === "loading" && ctx.data.attachments.find((item) => item.id === remove.data?.id)) {
      dispatch({ type: Types.RemoveAttachment, payload: remove.data.id });
    }
  }, [remove.state]);

  return (
    <li
      className={cn("grid p-2 bg-slate-2 border border-slate-5 rounded-lg gap-2 h-min relative", className)}
      {...rest}
    >
      <div className="aspect-video relative">
        {attachment.type.startsWith("image/") ? (
          <img className="aspect-video object-cover rounded-md" src={attachment.url} />
        ) : null}
        {attachment.type.startsWith("video/") ? (
          <ReactPlayer
            width="full"
            height="min-content"
            className="aspect-video object-cover rounded-md overflow-hidden"
            url={attachment.url}
            controls
          />
        ) : null}
        {attachment.is_unused && attachment.expires_at ? (
          <div className="absolute top-1 left-1 rounded-md grid grid-flow-col gap-1 bg-orange-3 p-1 items-center">
            <RiAlertFill className="h-4 w-4 text-orange-11" />
            <p className="text-orange-11 text-center font-semibold text-xs">
              {daysRemaining(attachment.expires_at) > 0 ? `${daysRemaining(attachment.expires_at)} DAYS` : `EXPIRED`}
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-flow-col items-center grid-cols-[max-content_1fr] gap-2 w-full">
        <Dialog>
          <div className="grid grid-flow-col gap-1.5 items-center w-min">
            <DialogTrigger>
              <IconButton
                className="bg-slate-4 hover:bg-slate-5 active:bg-slate-6 text-red-10"
                aria-label="delete"
                variant="subtle"
                size="sm"
                icon={<RiDeleteBin6Line />}
              />
            </DialogTrigger>
            <Link to={attachment.url} rel="noopener noreferrer" target="_blank">
              <IconButton
                className="bg-slate-4 hover:bg-slate-5 active:bg-slate-6"
                aria-label="open in new tab"
                variant="subtle"
                size="sm"
                icon={<RiShareBoxLine />}
              />
            </Link>
            <Popover.Root
              open={popover.open}
              onOpenChange={(open) => (open ? setTimeout(() => setPopover({ open: false }), 1000) : null)}
            >
              <Popover.Trigger asChild>
                <IconButton
                  className="bg-slate-4 hover:bg-slate-5 active:bg-slate-6"
                  aria-label="copy markdown"
                  variant="subtle"
                  size="sm"
                  icon={<RiClipboardLine />}
                  onClick={async () =>
                    await navigator.clipboard.writeText(attachment.url).then(() => setPopover({ open: !popover.open }))
                  }
                />
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align="center"
                  className="rounded-lg p-2 bg-slate-2 border border-slate-6 border-radius-6 shadow"
                >
                  <p className="text-xs text-slate-11">Copied to Cliboard</p>
                  <Popover.Arrow asChild>
                    <div className="relative h-3 w-3 origin-center rounded-br-sm border-b border-r border-slate-6 bg-slate-2 rotate-45 -translate-y-[0.375rem]" />
                  </Popover.Arrow>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          <div className="bg-slate-1 rounded-md h-full border border-slate-5 grid place-items-center w-full">
            <p className="text-slate-10 capitalize font-semibold text-sm">{humanFileSize(attachment.size)}</p>
          </div>
          <Portal>
            <DialogBackdrop className="bg-slateA-10 dark:bg-blackA-10 fixed inset-0" />
            <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-1 shadow-lg p-6 w-max">
              <DialogTitle className="text-xl font-semibold">Are you sure?</DialogTitle>
              <DialogDescription className="test-sm text-slate-11">
                Press confirm to delete the attachment.
              </DialogDescription>
              <div className="grid grid-flow-col pt-6 gap-2">
                <DialogCloseTrigger>
                  <Button variant="subtle">Close</Button>
                </DialogCloseTrigger>
                <remove.Form method="DELETE" action={`/attachment/${attachment.id}?index`}>
                  <Button
                    className="w-full"
                    type="submit"
                    variant="solid"
                    colorScheme="red"
                    isLoading={remove.state !== "idle"}
                    disabled={remove.state !== "idle"}
                  >
                    Confirm
                  </Button>
                </remove.Form>
              </div>
            </DialogContent>
          </Portal>
        </Dialog>
      </div>
    </li>
  );
}
