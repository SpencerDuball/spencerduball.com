import { AspectRatio, Flex, Grid, Image, useClipboard, IconButton, Icon, Link } from "@chakra-ui/react";
import type { IImageAttachment } from "../context";
import type { AspectRatioProps } from "@chakra-ui/react";
import { RiCheckFill, RiExternalLinkFill, RiLink } from "react-icons/ri";

// ImageAttachment
////////////////////////////////////////////////////////////////////////////////
export interface ImageAttachmentProps extends AspectRatioProps {
  image: IImageAttachment;
}

export const ImageAttachment = (props: ImageAttachmentProps) => {
  const { image, ...rest } = props;
  const { hasCopied, onCopy } = useClipboard(image.url);

  return (
    <AspectRatio
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      ratio={1}
      position="relative"
      sx={{ "&:hover > [data-image-overlay]": { visibility: "visible" } }}
      {...rest}
    >
      <>
        <Image src={image.url} h="full" w="full" objectFit="cover" />
        <Grid
          data-image-overlay
          visibility="hidden"
          position="absolute"
          top={0}
          left={0}
          h="full"
          w="full"
          _hover={{ bg: "blackA.9" }}
        >
          <Flex flexDir="column" position="absolute" top={2} right={2} gap={2}>
            <IconButton
              icon={<Icon as={hasCopied ? RiCheckFill : RiLink} />}
              onClick={onCopy}
              aria-label="copy url to clipboard"
            />
            <IconButton
              as={Link}
              href={image.url}
              icon={<Icon as={RiExternalLinkFill} />}
              aria-label="open image in new tab"
              target="_blank"
              rel="noopener noreferrer"
            />
          </Flex>
        </Grid>
      </>
    </AspectRatio>
  );
};
