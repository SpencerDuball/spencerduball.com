import * as React from "react";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { FileUploadBox } from "~/lib/ui/file-upload-box";
import { z } from "zod";
import { logger, db } from "~/lib/util/globals.server";
import { execute, getSessionInfo } from "~/lib/util/utils.server";
import { useLoaderData, useFetcher, useFetchers } from "@remix-run/react";
import { FileLi, DialogContent } from "~/lib/app/file-li";
import { IBlogFile, parseBlogFile } from "~/model/blogs";
import * as Dialog from "@radix-ui/react-dialog";
import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";

const ZLoaderParams = z.object({ blogId: z.string() });

export async function loader({ params, request }: LoaderFunctionArgs) {
  const log = logger(request);

  // check if user is admin
  const session = await getSessionInfo(request);
  if (!session?.roles.includes("admin")) throw redirect("/");

  const { blogId } = await ZLoaderParams.parseAsync(params).catch((e) => {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  });

  const files = await execute(db.selectFrom("blog_files").selectAll().where("blog_id", "=", blogId));

  return json({ files });
}

export default function BlogIdFiles() {
  const { files } = useLoaderData<typeof loader>();

  // control the dialog
  const [open, setOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<IBlogFile>(null!);
  const remove = useFetcher();

  // when a user uploads a file, we want to show the local file urls until the file is uploaded
  const fetchers = useFetchers();
  const [localFiles, setLocalFiles] = React.useState<File[]>([]);

  if (files.length === 0) {
    return (
      <div className="grid h-full w-full place-items-center">
        <FileUploadBox className="h-full max-h-[32rem] w-full max-w-[32rem]" />
      </div>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={() => setOpen(!open)}>
      <ScrollArea className="w-full">
        <ScrollViewport>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {files.map((file) => (
              <FileLi key={file.id} data={parseBlogFile(file)} onClickEdit={(data) => setSelectedFile(data)} />
            ))}
            <FileUploadBox className="aspect-square" />
          </ul>
          <Dialog.Portal>
            <Dialog.Overlay
              className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              onClick={() => setOpen(false)}
            />
            <DialogContent data={selectedFile} remove={remove} />
          </Dialog.Portal>
        </ScrollViewport>
      </ScrollArea>
    </Dialog.Root>
  );
}
