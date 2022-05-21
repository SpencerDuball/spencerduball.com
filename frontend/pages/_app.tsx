import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "theme/theme";
import { Grid, GridProps, Container } from "@chakra-ui/react";
import { Header } from "components/header/header";

const Main = (props: GridProps) => {
  const { children, ...rest } = props;
  return (
    <Grid as="main" {...rest}>
      <Container maxW="container.lg">{children}</Container>
    </Grid>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Grid gap={8}>
        <Header />
        <Main>
          <Component {...pageProps} />
        </Main>
      </Grid>
    </ChakraProvider>
  );
}

export default MyApp;
