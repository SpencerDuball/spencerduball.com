import { ScrollArea } from "@base-ui/react/scroll-area";
import { useInFenceFile } from "./multifence";

interface FenceProps extends React.ComponentProps<"pre"> {
  content: string;
  language: string;
}

export function Fence({ content, children, language, ...props }: FenceProps) {
  const isInFenceFile = useInFenceFile();

  if (isInFenceFile)
    return (
      <pre data-language={language} {...props}>
        <code dangerouslySetInnerHTML={{ __html: content }} />
      </pre>
    );

  return (
    <ScrollArea.Root className="fence h-auto w-full bg-(--tw-prose-pre-bg)">
      <ScrollArea.Viewport>
        <pre data-language={language} {...props}>
          <code dangerouslySetInnerHTML={{ __html: content }} />
        </pre>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="pointer-events-none relative flex rounded bg-(--tw-prose-pre-code)/20 opacity-0 transition-opacity before:absolute before:content-[''] data-hovering:pointer-events-auto data-hovering:opacity-100 data-hovering:delay-0 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0 data-[orientation=horizontal]:m-2 data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:before:right-0 data-[orientation=horizontal]:before:-bottom-2 data-[orientation=horizontal]:before:left-0 data-[orientation=horizontal]:before:h-5 data-[orientation=horizontal]:before:w-full data-[orientation=vertical]:m-2 data-[orientation=vertical]:w-1 data-[orientation=vertical]:before:left-1/2 data-[orientation=vertical]:before:h-full data-[orientation=vertical]:before:w-5 data-[orientation=vertical]:before:-translate-x-1/2"
        orientation="horizontal"
      >
        <ScrollArea.Thumb className="w-full rounded bg-(--tw-prose-pre-code)/60" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
