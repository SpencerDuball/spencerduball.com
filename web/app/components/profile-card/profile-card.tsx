import type { GridProps, LinkProps, PropsOf } from "@chakra-ui/react";
import { Grid, useColorMode, Text, VStack, HStack, Link, Icon, Avatar } from "@chakra-ui/react";
import { RiTwitterFill, RiGithubFill } from "react-icons/ri";
import { PrintablesIcon } from "~/components";

// SocialLink
/////////////////////////////////////////////////////////////////////////////
interface SocialLinkProps extends LinkProps {
  as: PropsOf<typeof Icon>["as"];
  ariaLabel: string;
}

const SocialLink = (props: SocialLinkProps) => {
  const { as, ariaLabel, ...rest } = props;
  return (
    <Link target="_blank" rel="noopener noreferrer" {...rest}>
      <Grid placeItems="center" h="8" w="8">
        <Icon as={as} h="4" w="4" aria-label={ariaLabel} />
      </Grid>
    </Link>
  );
};

// ProfileCard
/////////////////////////////////////////////////////////////////////////////
export interface ProfileCardProps extends GridProps {}

export const ProfileCard = (props: ProfileCardProps) => {
  const { colorMode } = useColorMode();

  // get the colors for the linear gradient background
  const firstColor = colorMode === "light" ? "var(--chakra-colors-yellowA-6)" : "var(--chakra-colors-yellowDarkA-6)";
  const secondColor = colorMode === "light" ? "var(--chakra-colors-crimsonA-6)" : "var(--chakra-colors-crimsonDarkA-6)";

  return (
    <Grid
      {...props}
      w="full"
      bg={`linear-gradient(120deg, ${firstColor}, ${secondColor})`}
      borderRadius="lg"
      gridTemplate="auto auto / auto auto"
      justifyContent="space-between"
      p="8"
      gap="8"
    >
      <VStack
        spacing="4"
        gridRow={{ base: "2 / span 1", sm: "1 / span 2" }}
        gridColumn={{ base: "1 / span 2", sm: "1 / span 1" }}
        alignItems={{ base: "center", sm: "start" }}
        sx={{
          "& p": {
            textAlign: { base: "center", sm: "initial" },
          },
        }}
      >
        {/* Name & Title */}
        <VStack spacing="1" alignItems="inherit">
          <Text as="p" fontSize="4xl" fontWeight="bold" lineHeight="normal" letterSpacing="tight">
            Spencer Duball
          </Text>
          <Text as="p" fontSize="md" fontWeight="bold">
            Software Engineer
          </Text>
        </VStack>
        {/* Description */}
        <Text as="p" maxW="sm" fontSize="md">
          Creating on the web, 3D printing, building circuits, and writing about all these topics.
        </Text>
        {/* Links */}
        <HStack>
          <SocialLink as={RiTwitterFill} href="https://twitter.com/SpencerDuball" ariaLabel="Twitter" />
          <SocialLink as={RiGithubFill} href="https://github.com/SpencerDuball" ariaLabel="Github" />
          <SocialLink
            as={PrintablesIcon}
            href="https://www.printables.com/social/212303-spencer_duball/about"
            ariaLabel="Printables"
          />
        </HStack>
      </VStack>
      <VStack gridRow={{ base: "1 / span 1", sm: "1 / span 2" }} gridColumn={{ base: "1 / span 2", sm: "2 / span 1" }}>
        <Avatar size="2xl" name="Spencer Duball" src="/images/profile.webp" />
      </VStack>
    </Grid>
  );
};
