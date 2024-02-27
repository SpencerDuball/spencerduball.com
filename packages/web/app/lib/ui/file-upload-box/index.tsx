import * as React from "react";
import { RiImageAddFill } from "react-icons/ri";
import { cn } from "~/lib/util/utils";
import { useDropArea } from "~/lib/hooks/react-use";
import { BlogCtx } from "~/model/blogs";
// @ts-ignore
import ms from "ms"; // TODO: This package has types that aren't defined correctly when using "Bundler" module resolution strategy.

/**
 * Uploads a file to the blog.
 *
 * @param blogId The blog id.
 * @param file The file to upload.
 */
async function uploadFile(blogId: string, file: File) {
  // create the SQL record and get the presigned post
  const formData = new FormData();
  formData.append("name", file.name);
  formData.append("size", file.size.toString());
  formData.append("type", file.type);
  formData.append("expires_at", new Date(Date.now() + ms("15m")).toISOString());
  const { presignedPost } = await fetch(`/blog/${blogId}/file`, { method: "POST", body: formData }).then((res) =>
    res.json(),
  );

  // upload the file to S3 using the presigned post
  const data = new FormData();
  for (let key in presignedPost.fields) {
    data.append(key, presignedPost.fields[key]);
  }
  data.append("file", file);
  await fetch(presignedPost.url, { method: "POST", body: data });
}

export interface FileUploadBoxProps extends React.ComponentProps<"div"> {}

export function FileUploadBox({ className, ...props }: FileUploadBoxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null!);

  const blog = React.useContext(BlogCtx);

  // create the div handlers
  const [bind] = useDropArea({
    onFiles: async (files) => {
      // TODO: Upload the files
      for (let file of files) {
        await uploadFile(blog.id, file);
      }
    },
  });
  function onClick() {
    inputRef.current.click();
  }
  const divHandlers = { onClick, ...bind };

  // setup the input handlers
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    // get the files
    const files = e.target.files;
    if (!files) return;

    // upload the files
    for (let file of files) {
      await uploadFile(blog.id, file);
    }

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
