import React from "react";
import type { PropsOf } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";
import * as RadixScroll from "@radix-ui/react-scroll-area";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";

// setup chakra styling
const UnstyledScrollArea = chakra(RadixScroll.ScrollArea);
const UnstyledScrollAreaViewport = chakra(RadixScroll.ScrollAreaViewport);
const UnstyledScrollAreaScrollbar = chakra(RadixScroll.ScrollAreaScrollbar);
const UnstyledScrollAreaThumb = chakra(RadixScroll.ScrollAreaThumb);

// style all components
const ScrollArea = (props: PropsOf<typeof UnstyledScrollArea>) => (
  <UnstyledScrollArea overflow="hidden" type="scroll" {...props} />
);

const ScrollAreaViewport = (props: PropsOf<typeof UnstyledScrollAreaViewport>) => (
  <UnstyledScrollAreaViewport asChild width="full" height="full" style={{ height: "100%" }} {...props} />
);

const ScrollAreaScrollbar = (props: PropsOf<typeof UnstyledScrollAreaScrollbar>) => {
  const c = useThemedColor();
  return (
    <UnstyledScrollAreaScrollbar
      display="flex"
      userSelect="none"
      padding={1}
      transition="background 160ms ease-out"
      _hover={{ background: c("_grayA.6") }}
      sx={{
        '&[data-orientation="vertical"]': { width: 3, height: "full" },
        '&[data-orientation="horizontal"]': { flexDirection: "column", height: 3, width: "full" },
      }}
      {...props}
    />
  );
};

const ScrollAreaThumb = (props: PropsOf<typeof UnstyledScrollAreaThumb>) => {
  const c = useThemedColor();
  return (
    <UnstyledScrollAreaThumb
      flex={1}
      background={c("_gray.10")}
      borderRadius="full"
      position="relative"
      sx={{
        "&::before": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "full",
          height: "full",
        },
      }}
      {...props}
    />
  );
};

// ScrollBox
export interface ScrollBoxProps extends PropsOf<typeof ScrollArea> {}

export const ScrollBox = (props: ScrollBoxProps) => {
  const { children, ...rest } = props;
  return (
    <ScrollArea {...rest}>
      <ScrollAreaViewport>{children}</ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  );
};
