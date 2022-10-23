import type { LoaderFunction } from "@remix-run/node";
import type { UserType } from "table";
import { Box } from "@chakra-ui/react";
import { ChakraHeaderHeight } from "~/components";
import { ChakraGapHeight } from "~/root";
import { MdxEditor } from "~/components";

interface LoaderData {
  user: UserType;
}

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};

export default function New() {
  return (
    <Box h={`calc(100vh - ${(ChakraHeaderHeight + ChakraGapHeight) * 4}px)`} maxW={`calc(100vw - ${8 * 4}px)`} py={8}>
      <MdxEditor h="full" />
    </Box>
  );
}
