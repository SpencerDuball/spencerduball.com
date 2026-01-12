interface ImageProps extends React.ComponentProps<"img"> {
  src: string;
  alt?: string;
  title?: string;
}

export function Image(props: ImageProps) {
  return <img {...props} />;
}
