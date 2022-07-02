import {
  Grid,
  GridProps,
  HStack,
  VStack,
  Text,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { format, parseISO } from "date-fns";
import { randomColor } from "@chakra-ui/theme-tools";

const lightColorPalettes = [
  "tomato",
  "red",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "grass",
  "brown",
  "orange",
];

export interface FrontmatterProps {
  url: string;
  title: string;
  sample: string;
  published: string;
  updated?: string;
  readingTime: number;
  tags?: string[];
  author: {
    image: string;
    name: string;
  };
}

export interface BlogLayoutProps extends GridProps {
  meta: FrontmatterProps;
}

export const BlogLayout = (props: BlogLayoutProps) => {
  const c = useThemedColor();
  return (
    <Grid {...props}>
      <VStack alignItems="start">
        <Text
          as="h1"
          fontSize={{ base: "3xl", sm: "5xl" }}
          lineHeight={1.2}
          letterSpacing="tighter"
          fontWeight="bold"
        >
          {props.meta.title}
        </Text>
        {props.meta.tags ? (
          <HStack>
            {props.meta.tags.map((tag) => (
              <Badge
                key={tag}
                variant="solid"
                colorScheme={randomColor({
                  string: tag,
                  colors: lightColorPalettes,
                })}
              >
                {tag}
              </Badge>
            ))}
          </HStack>
        ) : null}
        <HStack>
          <HStack>
            <Avatar
              size="sm"
              src={props.meta.author.image}
              name={props.meta.author.name}
            />
            <Text
              as="p"
              fontSize={{ base: "xs", sm: "sm" }}
              color={c("_gray.11")}
              fontWeight="semibold"
            >
              {props.meta.author.name} ·{" "}
              {format(parseISO(props.meta.published), "LLLL dd, yyyy")} ·{" "}
              {`${props.meta.readingTime} min read`}
            </Text>
          </HStack>
        </HStack>
      </VStack>
      <Grid maxW="100%">{props.children}</Grid>
    </Grid>
  );
};
