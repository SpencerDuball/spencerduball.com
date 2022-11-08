import { ScrollBox } from "~/components/scroll-box";
import type { ScrollBoxProps } from "~/components/scroll-box";
import { Grid } from "@chakra-ui/react";
import { ImageAttachment } from "./image-attachment";
import { VideoAttachment } from "./video-attachment";
import { AttachmentUploadBox } from "./attachment-upload-box";
import { useMdxEditorStore, ZImageAttachment, ZVideoAttachment } from "../context";

// ImageUpload
////////////////////////////////////////////////////////////////////////////////
export interface AttachmentsViewProps extends ScrollBoxProps {}

export const AttachmentsView = (props: AttachmentsViewProps) => {
  const store = useMdxEditorStore();

  return (
    <ScrollBox {...props}>
      {store.editor.attachments.length > 0 ? (
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap={2}>
          {store.editor.attachments.map((att) => {
            // display image attachment
            const safeImg = ZImageAttachment.safeParse(att);
            if (safeImg.success) return <ImageAttachment key={safeImg.data.id} image={safeImg.data} />;

            // display video attachment
            const safeVid = ZVideoAttachment.safeParse(att);
            if (safeVid.success) return <VideoAttachment key={safeVid.data.id} video={safeVid.data} />;

            return null;
          })}
          <AttachmentUploadBox />
        </Grid>
      ) : (
        <Grid placeItems="center" w="full">
          <AttachmentUploadBox w="full" maxW="container.sm" />
        </Grid>
      )}
    </ScrollBox>
  );
};
