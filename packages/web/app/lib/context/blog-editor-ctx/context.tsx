import * as React from "react";
import { type IBlogEditorCtxState, type Actions, reducer, Types } from "./reducer";
import { IBlog, IBlogFile, parseBlogFile } from "~/model/blogs";
import axios from "axios";
// @ts-ignore
import ms from "ms"; // TODO: This package has types that aren't defined correctly when using "Bundler" module resolution strategy.
import { useRevalidator } from "@remix-run/react";

/* ------------------------------------------------------------------------------------------------------------------
 * Define BlogEditorCtx, BlogEditorCtxProvider
 * ------------------------------------------------------------------------------------------------------------------ */
// define initial BlogEditorCtxState
export const InitialBlogEditorCtxState: IBlogEditorCtxState = {
  blog: {} as IBlog, // This will always be passed as a prop.
  files: [],
};

// create BlogEditorCtx
export const BlogEditorCtx = React.createContext<[IBlogEditorCtxState, React.Dispatch<Actions>]>([
  InitialBlogEditorCtxState,
  () => null,
]);

export interface BlogEditorCtxProviderProps {
  blog: IBlog;
  children: React.ReactNode;
}

export function BlogEditorCtxProvider({ blog, children }: BlogEditorCtxProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, InitialBlogEditorCtxState);

  return <BlogEditorCtx.Provider value={[{ ...state, blog }, dispatch]}>{children}</BlogEditorCtx.Provider>;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Define Dispatchers
 * ------------------------------------------------------------------------------------------------------------------ */
export function useBlogUploader(records: IBlogFile[]) {
  const [{ blog, files }, dispatch] = React.useContext(BlogEditorCtx);
  const revalidator = useRevalidator();

  /**
   * When the records or files change in response to a revalidation or any upload progress change we check if the files
   * have finished uploading (percent === 100) and the revalidation has finished (matching record for the file exists).
   *
   * It is necessary to separate this out into a useEffect because we initiate a revalidation in the `onFile` function
   * and we need to wait for the revalidation to finish before we can remove the file from the state or else there will
   * be a flash.
   */
  React.useEffect(() => {
    // find all the files that have finished uploading
    const recordsIds = records.map((record) => record.id);
    const uploadedFiles = files.filter((file) => recordsIds.includes(file.record.id) && file.percent === 100);

    // remove the uploaded files from the state
    uploadedFiles.forEach((file) => {
      dispatch({ type: Types.RemoveFile, payload: { blogFileId: file.record.id } });
    });
  }, [records, files]);

  // create the upload function
  async function onFile(file: File) {
    // create the SQL record
    const formData = new FormData();
    formData.set("name", file.name);
    formData.set("size", file.size.toString());
    formData.set("type", file.type);
    formData.set("expires_at", new Date(Date.now() + ms("15d")).toISOString());
    const { presignedPost, blogFile } = await axios
      .post(`/blog/${blog.id}/file`, formData)
      .then(({ data }) => ({ ...data, blogFile: parseBlogFile(data.blogFile) }));

    // dispatch an action to track the uploading file
    dispatch({ type: Types.AddFile, payload: { record: { ...blogFile, url: URL.createObjectURL(file) }, file } });

    // upload the file with the presignedPost
    const data = new FormData();
    for (const key in presignedPost.fields) data.set(key, presignedPost.fields[key]);
    data.set("file", file);

    await axios.post(presignedPost.url, data, {
      onUploadProgress: (e) => {
        // update the file progress
        const percent = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
        dispatch({ type: Types.SetFileProgress, payload: { blogFileId: blogFile.id, percent } });

        // When the file has finished uploading:
        // 1. Download the file so it is cached in the browser.
        // 2. Revalidate the Remix site.
        if (percent === 100) {
          const image = new Image();
          image.src = blogFile.url;
          image.onload = () => revalidator.revalidate();
        }
      },
    });
  }

  return { onFile, files };
}
