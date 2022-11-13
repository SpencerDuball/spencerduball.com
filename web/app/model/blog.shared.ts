import { z } from "zod";

export const ZPreviewResponse = z.object({
  code: z.string(),
  title: z.string().min(3),
  image: z.string(),
  tags: z.string().array(),
});
export type IPreviewResponse = z.infer<typeof ZPreviewResponse>;
