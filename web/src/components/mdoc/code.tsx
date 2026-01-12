export function Code({ content, ...props }: React.ComponentProps<"code">) {
  return <code {...props}>{content}</code>;
}
