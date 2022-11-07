import { useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { Toolbar } from "./toolbar";
import { useMdxEditorStore } from "./context";
import { useWindowSize } from "react-use";
import { MdxView } from "./mdx-view/mdx-view";

/** Computes the non-dynamic height and width for the codemirror editor. */
const useCodeMirrorDimensions = () => {
  const [containerRef, toolbarRef] = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

  // will trigger a re-render on window resize, needed to trigger height recomputation
  const { height: h, width: w } = useWindowSize();

  // extract the heights in pixels into "dimensions"
  useEffect(() => {
    if (containerRef && containerRef.current && toolbarRef && toolbarRef.current) {
      const [container, toolbar] = [containerRef.current, toolbarRef.current];
      setDimensions({ height: container.clientHeight - toolbar.clientHeight, width: container.clientWidth });
    }
  }, [containerRef, toolbarRef, h, w]);

  // compute the height & width strings
  const height = dimensions.height ? `${dimensions.height}px` : "100%";
  const width = dimensions.width ? `${dimensions.width}px` : "100%";

  return { height, width, containerRef, toolbarRef };
};

// MdxEditor
////////////////////////////////////////////////////////////////////////////////
export interface MdxEditorProps extends BoxProps {}

export const MdxEditor = (props: MdxEditorProps) => {
  const { height, width, containerRef, toolbarRef } = useCodeMirrorDimensions();
  const store = useMdxEditorStore();

  return (
    <Box ref={containerRef} display="grid" gridTemplateRows="max-content 1fr" {...props}>
      <Toolbar ref={toolbarRef} />
      {store.settings.view === "code" ? <MdxView height={height} width={width} /> : null}
    </Box>
  );
};
