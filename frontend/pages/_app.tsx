import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "theme/theme";
import { Grid, GridProps, Container } from "@chakra-ui/react";
import { Header } from "components";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <Grid gap={8}>
          <Header />
          <Main>
            <Component {...pageProps} />
          </Main>
        </Grid>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default MyApp;
