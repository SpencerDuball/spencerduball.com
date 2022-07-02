import NextImage from "next/image";
import { StringWithAutocomplete } from "utils/type-utils";
import { Center } from "@chakra-ui/react";

type Size = StringWithAutocomplete<"sm" | "md" | "lg">;

const sizes: Record<Size, number> = {
  sm: 400,
  md: 600,
  lg: 800,
};

interface ImageProps {
  src: string;
  alt: string;
  size?: Size;
  aspectRatio?: number;
}

/**
 * A NextJs optimized image, `src` and `alt` props require no explaining.
 * Prop `size` can be "sm" | "md" | "lg". "md" is default. Prop `aspectRatio`
 * is a number representing the ratio width / height. This will only change
 * the height.
 *
 * @param props
 * @returns
 */
const Image = (props: ImageProps) => {
  let { src, alt, size, aspectRatio } = props;

  if (!size) size = "md";
  if (!aspectRatio) aspectRatio = 4 / 3;

  // compute height/width
  const width = sizes[size];
  const height = width * (1 / aspectRatio);

  return (
    <Center as="span">
      <NextImage
        unoptimized
        width={width}
        height={height}
        src={src}
        alt={alt}
        objectFit="cover"
      />
    </Center>
  );
};

export const image = {
  render: Image,
  attributes: {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    size: { type: String },
    aspectRatio: { type: Number },
  },
};
