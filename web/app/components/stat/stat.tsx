import { Box, Heading, Stack, Text, useBreakpointValue } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";

// Stat
////////////////////////////////////////////////////////////////////////////////
export interface StatProps extends BoxProps {
  label: string;
  value: string;
}

export const Stat = (props: StatProps) => {
  const { label, value, ...rest } = props;
  const c = useThemedColor();

  return (
    <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }} bg={c("_gray.3")} borderRadius="lg" boxShadow="sm" {...rest}>
      <Stack>
        <Text fontSize="md" color={c("_gray.11")}>
          {label}
        </Text>
        <Text fontSize="4xl" fontWeight="black">
          {value}
        </Text>
      </Stack>
    </Box>
  );
};
