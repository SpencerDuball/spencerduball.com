import { useRef } from "react";
import { AspectRatio, Grid, Icon } from "@chakra-ui/react";
import { RiImageAddFill } from "react-icons/ri";
import type { AspectRatioProps } from "@chakra-ui/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { useMdxEditorState } from "../context";
import { v4 as uuidv4 } from "uuid";

/** Define the file-upload-input event handlers. */
const useFileUploadHandlers = (ref: React.RefObject<HTMLInputElement>) => {
  const state = useMdxEditorState();

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // extract the file
    const dtItem = e.dataTransfer.items[0];
    const file = dtItem.kind === "file" && dtItem.getAsFile();

    // add attachment to list
    if (file) {
      let attachment = {
        type: "local",
        id: uuidv4(),
        mime: file.type,
        url: URL.createObjectURL(file),
        file,
      } as const;
      state.editor.attachments.push(attachment);
    }
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => ref && ref.current && ref.current.click();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    if (file) {
      // add attachment to list
      const attachment = {
        type: "local",
        id: uuidv4(),
        mime: file.type,
        url: URL.createObjectURL(file),
        file,
      } as const;
      state.editor.attachments.push(attachment);

      // reset the input
      e.target.value = "";
    }
  };

  return { buttonHandlers: { onDragOver, onDrop, onClick }, inputHandlers: { onChange } };
};

// ImageUpload
////////////////////////////////////////////////////////////////////////////////
export interface AttachmentUploadBoxProps extends AspectRatioProps {}

export const AttachmentUploadBox = (props: AttachmentUploadBoxProps) => {
  const c = useThemedColor();
  const inputRef = useRef<HTMLInputElement>(null);
  const { buttonHandlers, inputHandlers } = useFileUploadHandlers(inputRef);

  return (
    <AspectRatio
      borderRadius="lg"
      overflow="hidden"
      borderStyle="dashed"
      borderWidth={4}
      borderColor={c("_grayA.6")}
      color={c("_grayA.6")}
      ratio={1}
      cursor="pointer"
      {...buttonHandlers}
      {...props}
    >
      <Grid placeItems="center">
        <input ref={inputRef} style={{ display: "none" }} type="file" {...inputHandlers} />
        <Icon h="25%" w="25%" as={RiImageAddFill} />
      </Grid>
    </AspectRatio>
  );
};
