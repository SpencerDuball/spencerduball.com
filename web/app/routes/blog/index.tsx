import { Flex, Grid, Text, Box, Input, Badge } from "@chakra-ui/react";

export default function Posts() {
  return (
    <Box maxW="container.md">
      {/* Posts Introduction */}
      <Grid gap={2}>
        <Text fontSize="5xl" fontWeight="bold" flexGrow={1}>
          Posts
        </Text>
        <Text>
          I write mostly about web development and cloud computing, and sometimes about 3D printing and circuits. I hope
          you find something useful!
        </Text>
        <Input variant="filled" placeholder="Search ..." />
        <Flex gap={2}>
          {[
            ["web", "red"],
            ["aws", "blue"],
            ["3d-print", "orange"],
            ["circuit", "green"],
          ].map(([title, color]) => (
            <Badge key={title} fontSize="sm" variant="subtle" colorScheme={color}>
              {title}
            </Badge>
          ))}
        </Flex>
      </Grid>
    </Box>
  );
}
