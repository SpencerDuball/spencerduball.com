import type { Simplify, Selectable } from "kysely";
import type { IAttachment as IPgAttachment } from "@spencerduballcom/db/pg";
import type { Dispatch } from "react";
import { Types as CmsEditorTypes } from "~/components/app/cms-editor-ctx";
import type { Actions as CmsEditorActions } from "~/components/app/cms-editor-ctx";
import { Types as ToasterTypes } from "~/components/app/toaster";
import type { Actions as ToasterActions } from "~/components/app/toaster";
import type { AxiosProgressEvent } from "axios";
import { z } from "zod";

// ------------------------------------------------------------------------------------------------------------
// Define Attachment Types
// ------------------------------------------------------------------------------------------------------------
export const ZAttachment = z.object({
  id: z.string(),
  size: z.number(),
  type: z.custom<`image/${string}` | `video/${string}`>((val) => !!(val as string).match(/^(image|video)\//)),
  url: z.string(),
  blog_id: z.number(),
  is_unused: z.boolean(),
  expires_at: z.null().or(z.coerce.date()),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
  upload_pct: z.number(),
});
export type IAttachment = z.infer<typeof ZAttachment>;

// ------------------------------------------------------------------------------------------------------------
// Define Utility Functions
// ------------------------------------------------------------------------------------------------------------
/**
 * Input size in bytes, get a human-readable file string.
 */
export function humanFileSize(size: number) {
  let i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return Number((size / Math.pow(1024, i)).toFixed(2)) * 1 + " " + ["B", "kB", "MB", "GB", "TB"][i];
}

export interface IOnUploadProgress {
  file: File;
  attachment: Simplify<Selectable<IPgAttachment>>;
  editorDispatch: Dispatch<CmsEditorActions>;
  toasterDispatch: React.Dispatch<ToasterActions>;
}
export function onUploadProgress({ file, attachment, editorDispatch, toasterDispatch }: IOnUploadProgress) {
  const fileObjectUrl = URL.createObjectURL(file);
  let hasToasted = false;
  return function onUploadProgress(event: AxiosProgressEvent) {
    // validate the attachment
    const a = ZAttachment.omit({ upload_pct: true }).parse(attachment);

    if (!event.total) {
      // if uploaded without streaming, set as success
      editorDispatch({ type: CmsEditorTypes.UpsertAttachment, payload: { ...a, upload_pct: 100 } });
      toasterDispatch({
        type: ToasterTypes.AddToast,
        payload: {
          id: a.id.toString(),
          type: "success",
          title: "Uploaded!",
          description: `Uploaded ${humanFileSize(a.size)} file.`,
          duration: 3000,
        },
      });
    } else {
      // if uploaded with streaming
      const upload_pct = Math.round((event.loaded * 100) / event.total);
      if (upload_pct === 100) {
        const pld = {
          id: a.id,
          type: "success",
          title: "Uploaded!",
          description: `Uploaded ${humanFileSize(a.size)} file.`,
          placement: "bottom-end",
          duration: 3000,
        };

        // give s3 a little time to process or we might get a 403 response
        const S3ProcessTime = 250;
        setTimeout(() => {
          editorDispatch({ type: CmsEditorTypes.UpsertAttachment, payload: { ...a, url: a.url, upload_pct } });
          if (hasToasted) toasterDispatch({ type: ToasterTypes.UpdateToast, payload: pld });
          else toasterDispatch({ type: ToasterTypes.AddToast, payload: pld });
        }, S3ProcessTime);
      } else {
        editorDispatch({ type: CmsEditorTypes.UpsertAttachment, payload: { ...a, url: fileObjectUrl, upload_pct } });
        const pld = {
          id: a.id.toString(),
          title: "Uploading ...",
          description: `Uploading ${humanFileSize(a.size)} - ${upload_pct}%`,
          duration: Infinity,
        };
        if (hasToasted) toasterDispatch({ type: ToasterTypes.UpsertToast, payload: pld });
        else {
          toasterDispatch({ type: ToasterTypes.UpdateToast, payload: pld });
          hasToasted = true;
        }
      }
    }
  };
}
