import { ForwardRefExoticComponent, RefAttributes } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { chakra, PropsOf } from "@chakra-ui/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";

// add chakra style props to primitives
type ScrollAreaTypeFix = ForwardRefExoticComponent<
  Omit<ScrollAreaPrimitive.ScrollAreaProps, "dir"> &
    RefAttributes<HTMLDivElement>
>;
const UnstyledScrollArea = chakra<ScrollAreaTypeFix>(ScrollAreaPrimitive.Root);
const UnstyledViewport = chakra(ScrollAreaPrimitive.Viewport);
const UnstyledScrollbar = chakra(ScrollAreaPrimitive.Scrollbar);
const UnstyledThumb = chakra(ScrollAreaPrimitive.Thumb);

const ScrollArea = (props: PropsOf<typeof UnstyledScrollArea>) => {
  return <UnstyledScrollArea overflow="hidden" type="scroll" {...props} />;
};

const Viewport = (props: PropsOf<typeof UnstyledViewport>) => {
  return <UnstyledViewport width="full" height="full" {...props} />;
};

const Scrollbar = (props: PropsOf<typeof UnstyledScrollbar>) => {
  const c = useThemedColor();
  return (
    <UnstyledScrollbar
      display="flex"
      userSelect="none"
      touchAction="none"
      padding={1}
      transition="background 160ms ease-out"
      _hover={{ background: c("_grayA.6") }}
      sx={{
        '&[data-orientation="vertical"]': {
          width: 3,
          height: "100%",
        },
        '&[data-orientation="horizontal"]': {
          flexDirection: "column",
          height: 3,
          width: "full",
        },
      }}
      {...props}
    />
  );
};

const Thumb = (props: PropsOf<typeof UnstyledThumb>) => {
  const c = useThemedColor();
  return (
    <UnstyledThumb
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

export interface ScrollboxProps extends PropsOf<typeof ScrollArea> {}

export const Scrollbox = (props: PropsOf<typeof ScrollArea>) => {
  const { children, ...rest } = props;
  return (
    <ScrollArea className="component-scrollarea" {...rest}>
      <Viewport>{children}</Viewport>
      <Scrollbar orientation="vertical">
        <Thumb />
      </Scrollbar>
      <Scrollbar orientation="horizontal">
        <Thumb />
      </Scrollbar>
    </ScrollArea>
  );
};
