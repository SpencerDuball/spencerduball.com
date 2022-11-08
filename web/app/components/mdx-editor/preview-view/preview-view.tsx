import { Box } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { useActionData } from "@remix-run/react";
import { getMDXComponent } from "mdx-bundler/client";
import { components } from "./mdx-components";

// PreviewView
////////////////////////////////////////////////////////////////////////////////
export interface PreviewViewProps extends BoxProps {}

export const PreviewView = (props: PreviewViewProps) => {
  const data = useActionData();

  if (!(data && data.code)) return null;

  const Component = getMDXComponent(data.code);
  return (
    <Box {...props}>
      <Component components={components as any} />
    </Box>
  );
};
