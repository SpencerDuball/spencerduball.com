import { AspectRatio, Box, Grid, Image, Text, Avatar, useBreakpointValue, Flex, Badge } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { getMDXComponent } from "mdx-bundler/client";
import { components } from "~/components/mdx-components";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { randomColorScheme } from "~/util";

export interface IBlogData {
  title: string;
  image: string;
  tags: string[];
  code: string;
}

// TitleCard
////////////////////////////////////////////////////////////////////////////////
interface TitleCardProps extends BoxProps {
  title: string;
  image: string;
  tags: string[];
}

const TitleCard = (props: TitleCardProps) => {
  const { title, image, tags, ...rest } = props;
  const titleSize = useBreakpointValue({ base: "4xl", md: "5xl" });
  const c = useThemedColor();

  return (
    <Box display="grid" gap={4} {...rest}>
      {/* Title */}
      <Grid>
        <Text as="h1" fontSize={titleSize} fontWeight="black">
          {title}
        </Text>
        <Flex alignItems="center">
          {/* Author & Date */}
          <Flex gap={2} alignItems="center">
            <Avatar size="sm" name="Spencer Duball" src="/images/profile.webp" />
            <Text fontSize="sm" color={c("_gray.11")}>
              Spencer Duball - {new Date(Date.now()).toDateString()}
            </Text>
          </Flex>
          {/* Links */}
          <Flex gap={2}></Flex>
        </Flex>
      </Grid>
      {/* Splash Image */}
      <AspectRatio ratio={2} borderRadius="lg" overflow="hidden">
        <Image src={image} objectFit="cover" />
      </AspectRatio>
      <Flex gap={2}>
        {tags.map((tag) => (
          <Badge key={tag} fontSize="md" variant="solid" colorScheme={randomColorScheme(tag)}>
            {tag}
          </Badge>
        ))}
      </Flex>
    </Box>
  );
};

// BlogPost
////////////////////////////////////////////////////////////////////////////////
export interface BlogPostProps extends BoxProps {
  blog: IBlogData;
}

export const BlogPost = (props: BlogPostProps) => {
  const { blog, ...rest } = props;

  const Component = getMDXComponent(blog.code);
  return (
    <Box {...rest}>
      <TitleCard title={blog.title} image={blog.image} tags={blog.tags} />
      <Component components={components as any} />
    </Box>
  );
};
