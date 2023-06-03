import * as React from "react";
import { cn, colorFromName } from "~/lib/util";
import { ScrollArea, ScrollViewport } from "~/components/ui/scroll-box";
import { Tag, tagConfig, TagProps } from "~/components/ui/tag";
import { Link, useFetcher } from "@remix-run/react";
import { IconButton, Button } from "~/components/ui/button";
import { RiDeleteBin6Line, RiEdit2Line, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
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

const ColorList = Object.keys(tagConfig.variants.colorScheme) as NonNullable<TagProps["colorScheme"]>[];

export interface BlogPostLiProps extends React.ComponentProps<"li"> {
  hasControls?: boolean;
  data: {
    id: number;
    title: string;
    image_url: string;
    author_id: number;
    views: number;
    published_at: Date | null;
    tags: string[];
    published: boolean;
  };
}
export function BlogPostLi({ hasControls, data, className, ...props }: BlogPostLiProps) {
  const published = useFetcher();
  const remove = useFetcher();

  const isPublished =
    (published.state !== "idle" && published.formData?.get("published") === "true") ||
    (published.state === "idle" && data.published);

  return (
    <li
      className={cn(
        "grid gap-2 rounded-lg bg-slate-2 overflow-hidden border border-slate-4 md:grid-flow-col md:gap-3 md:grid-cols-[max-content_1fr] relative",
        { className }
      )}
      {...props}
    >
      {/* Image Section */}
      <div className="grid md:max-w-[14rem] md:p-3 md:pr-0">
        <img className="w-full aspect-[2/1] md:rounded md:overflow-hidden object-cover" src={data.image_url} />
      </div>
      {/* Info Section */}
      <div className="grid p-3 pt-0 gap-2 md:p-3 md:pl-0 md:content-start">
        {data.tags ? (
          <ScrollArea>
            <ScrollViewport>
              <div className="flex gap-2">
                {data.tags.sort().map((tag) => (
                  <Tag
                    key={tag}
                    className="border border-slate-4"
                    variant="subtle"
                    colorScheme={colorFromName({ name: tag, colors: ColorList })}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            </ScrollViewport>
          </ScrollArea>
        ) : null}
        <Link
          to={`/blog/${data.id}`}
          className="focus-outline leading-tight text-2xl font-semibold line-clamp-3 md:text-xl md:leading-[1.15]"
        >
          {data.title}
        </Link>
        <div className="text-md text-slate-9 flex gap-2">
          <p>
            {data.published_at?.toLocaleDateString() || "Unpublished"} &#11825; {data.views} Views
          </p>
        </div>
      </div>
      {/* Controls Overlay */}
      {hasControls ? (
        <Dialog>
          {/* <ButtonGroup variant="subtle" size={"sm"} isAttached={!isMd} className="absolute top-3 right-3"> */}
          <div className="grid grid-flow-col absolute top-3 right-3 md:gap-1.5">
            <published.Form method="PATCH" action={`/blog/${data.id}?index`}>
              <input type="hidden" name="published" value={JSON.stringify(!isPublished)} />
              <IconButton
                type="submit"
                variant="subtle"
                size="sm"
                aria-label={isPublished ? "hide post" : "show post"}
                className="rounded-r-none md:rounded-full text-green-11"
                icon={isPublished ? <RiEyeLine /> : <RiEyeOffLine />}
              />
            </published.Form>
            <Link to={`/dashboard/cms/blog/${data.id}/edit`}>
              <IconButton
                variant="subtle"
                size="sm"
                aria-label="edit post"
                className="rounded-none md:rounded-full text-blue-11"
                icon={<RiEdit2Line />}
              />
            </Link>
            <DialogTrigger>
              <IconButton
                variant="subtle"
                size="sm"
                aria-label="delete post"
                className="rounded-l-none md:rounded-full text-red-11"
                icon={<RiDeleteBin6Line />}
              />
            </DialogTrigger>
          </div>
          <Portal>
            <DialogBackdrop className="bg-slateA-10 fixed inset-0" />
            <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-1 shadow-lg p-6 w-max">
              <DialogTitle className="text-xl font-semibold">Are you sure?</DialogTitle>
              <DialogDescription className="test-sm text-slate-11">
                Press confirm to delete the blog post.
              </DialogDescription>
              <div className="grid grid-flow-col pt-6 gap-2">
                <DialogCloseTrigger>
                  <Button variant="subtle">Close</Button>
                </DialogCloseTrigger>
                <remove.Form method="DELETE" action={`/blog/${data.id}?index`}>
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
      ) : null}
    </li>
  );
}
