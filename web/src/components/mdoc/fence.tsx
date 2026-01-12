interface FenceProps extends React.ComponentProps<"pre"> {
  content: string;
  language: string;
}

export function Fence({ content, children, language, ...props }: FenceProps) {
  return (
    <pre data-language={language} {...props}>
      <code dangerouslySetInnerHTML={{ __html: content }} />
    </pre>
  );
}
