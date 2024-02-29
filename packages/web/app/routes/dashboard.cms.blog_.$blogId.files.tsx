import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { FileUploadBox } from "~/lib/ui/file-upload-box";
import { z } from "zod";
import { logger, db } from "~/lib/util/globals.server";
import { execute, getSessionInfo } from "~/lib/util/utils.server";
import { useLoaderData } from "@remix-run/react";
import { FileLi } from "~/lib/app/file-li";
import { parseBlogFile } from "~/model/blogs";
import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";
import { useBlogUploader } from "~/lib/context/blog-editor-ctx";

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
  const { onFile, files: uploading } = useBlogUploader();

  // get all the files not uploading
  const parsedFiles = files
    .map(parseBlogFile)
    .filter((file) => !uploading.some((uploadingFile) => uploadingFile.record.id === file.id))
    .sort((curr, next) => curr.created_at.getTime() - next.created_at.getTime());

  // sort the uploading files by the created_at time
  uploading.sort((curr, next) => curr.record.created_at.getTime() - next.record.created_at.getTime());

  if (files.length === 0) {
    return (
      <div className="grid h-full w-full place-items-center">
        <FileUploadBox onFile={onFile} className="h-full max-h-[32rem] w-full max-w-[32rem]" />
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <ScrollViewport>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {parsedFiles.map((file) => (
            <FileLi key={file.id} data={file} />
          ))}
          {uploading.map((file) => (
            <FileLi key={file.record.id} data={file.record} />
          ))}
          <FileUploadBox onFile={onFile} className="aspect-square" />
        </ul>
      </ScrollViewport>
    </ScrollArea>
  );
}
