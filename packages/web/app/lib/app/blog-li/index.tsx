import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";
import { Link, useFetcher } from "@remix-run/react";
import * as React from "react";
import { cn, idFromHeading } from "~/lib/util/utils";
import { ColorList, Tag, colorFromName } from "~/lib/ui/tag";
import { IBlog } from "~/model/blogs";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, IconButton } from "~/lib/ui/button";
import { RiEyeLine, RiEyeOffLine, RiEdit2Line, RiDeleteBin6Line, RiCloseLine } from "react-icons/ri";

type IBlogLiData = Omit<IBlog, "body">;

//---------------------------------------------------------------------------------------------------------------------
// Controls
// --------
// The controls part of the BlogLi item.
//---------------------------------------------------------------------------------------------------------------------
interface ControlsProps extends React.ComponentPropsWithoutRef<"div"> {
  data: IBlogLiData;
}
function Controls({ data, className, ...props }: ControlsProps) {
  const update = useFetcher();
  const isPublished =
    (update.state !== "idle" && update.formData?.get("published") === "true") ||
    (update.state === "idle" && data.published);

  const closeBtn = React.useRef<HTMLButtonElement>(null!);
  const remove = useFetcher();
  React.useEffect(() => {
    if (remove.state === "submitting" && closeBtn && closeBtn.current) closeBtn.current.click();
  }, [remove.state]);

  return (
    <Dialog.Root>
      <div
        className={cn(
          "grid h-5 grid-flow-col gap-1.5 overflow-visible",
          "translate-x-[calc(theme(spacing[2.5])/2)] [&>*]:relative [&>*]:top-2.5 [&>*]:-translate-y-1/2",
          className,
        )}
        {...props}
      >
        <update.Form action={`/blog/${data.id}`} method="patch">
          <input type="hidden" name="published" value={String(!isPublished)} />
          <IconButton
            type="submit"
            variant="subtle"
            size="sm"
            aria-label={isPublished ? "hide post" : "show post"}
            className="rounded-full text-green-11"
            icon={isPublished ? <RiEyeLine /> : <RiEyeOffLine />}
          />
        </update.Form>
        <Link to={`/dashboard/cms/blog/${data.id}/edit`}>
          <IconButton
            variant="subtle"
            size="sm"
            aria-label="edit post"
            className="rounded-full text-blue-11"
            icon={<RiEdit2Line />}
          />
        </Link>
        <Dialog.Trigger asChild>
          <IconButton
            variant="subtle"
            size="sm"
            aria-label="delete post"
            className="rounded-full text-red-11"
            icon={<RiDeleteBin6Line />}
          />
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlay-show fixed inset-0 bg-blackA-6" />
        <Dialog.Content className="data-[state=open]:animate-content-show fixed left-1/2 top-1/2 grid w-80 -translate-x-1/2 -translate-y-1/2 auto-cols-auto gap-4 rounded-lg border border-slate-6 bg-slate-2 p-4 shadow-lg focus:outline-none">
          <div className="relative grid">
            <h1 className="text-xl font-semibold">Are you sure?</h1>
            <p className="text-sm text-slate-11">Press confirm to delete the blog post.</p>
            <remove.Form action={`/blog/${data.id}`} method="delete" className="grid pt-6">
              <Button type="submit" variant="solid" colorScheme="red" className="w-full">
                Confirm
              </Button>
            </remove.Form>
          </div>
          <Dialog.Close asChild autoFocus>
            <IconButton
              ref={closeBtn}
              variant="subtle"
              size="xs"
              icon={<RiCloseLine />}
              aria-label="Close dialog."
              className="absolute right-2 top-2"
            />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

//---------------------------------------------------------------------------------------------------------------------
// BlogLi
// --------
// The full BlogLi component.
//---------------------------------------------------------------------------------------------------------------------
export interface BlogLiProps extends React.ComponentProps<"li"> {
  hasControls?: boolean;
  data: IBlogLiData;
}

export function BlogLi({ hasControls, data, className, ...props }: BlogLiProps) {
  return (
    <li
      className={cn(
        // The BlogLi height is equal to the largest sub-item + padding height + border height.
        // This is h-24 (image height) + h-6 (padding height * 2) + 2px (border height * 2) = calc(30/4 + 2px)
        "relative grid h-[calc(7.5rem+2px)] grid-flow-col grid-cols-1 gap-3 rounded-lg border border-slate-4 bg-slate-2 p-3 md:grid-cols-[max-content_1fr]",
        className,
      )}
      {...props}
    >
      {/* Image Section */}
      <div className="relative hidden pr-0 md:grid">
        <div className="h-24 w-48 animate-pulse rounded bg-slate-3" />
        <img
          className="absolute left-0 top-0 aspect-[2/1] h-24 w-48 overflow-hidden rounded object-cover"
          alt={data.cover_img.alt}
          src={data.cover_img.url}
        />
      </div>
      {/* Info Section */}
      <div className="grid auto-rows-max gap-[calc(theme(spacing.2)-2px)]">
        <div className="grid h-5 grid-flow-col grid-cols-[1fr_max-content]">
          <ScrollArea>
            <ScrollViewport>
              <div className="flex gap-2">
                {data.tags.map((name) => (
                  <Tag
                    key={name}
                    className="border border-slate-4"
                    variant="subtle"
                    size="sm"
                    colorScheme={colorFromName({ name, colors: ColorList })}
                  >
                    {name}
                  </Tag>
                ))}
              </div>
            </ScrollViewport>
          </ScrollArea>
          {hasControls && <Controls data={data} />}
        </div>
        <div className="grid auto-rows-[max-content] gap-1">
          <Link
            to={`/blog/${idFromHeading(data.title)}-${data.id}`}
            className="focus-outline line-clamp-2 text-xl font-semibold leading-[1.15]"
          >
            {data.title}
          </Link>
          <p className="text-sm text-slate-9" suppressHydrationWarning>
            {data.published_at ? new Date(data.published_at).toLocaleDateString() : "Unpublished"} &#11825; {data.views}{" "}
            Views
          </p>
        </div>
      </div>
    </li>
  );
}
