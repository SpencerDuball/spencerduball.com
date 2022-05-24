import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "theme/theme";
import { Grid, GridProps, Container } from "@chakra-ui/react";
import { Header } from "components/header/header";
import { BlogLayout } from "components/blog-layout/blog-layout";
import { allPosts } from "contentlayer/generated";

const Main = (props: GridProps) => {
  const { children, ...rest } = props;
  return (
    <Grid as="main" {...rest}>
      <Container maxW="container.lg">{children}</Container>
    </Grid>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  // get the post if a markdoc file
  let post = undefined;
  if ("markdoc" in pageProps) {
    post = allPosts.find(
      (post) => "/" + post._id === pageProps.markdoc.file.path
    );
  }
  return (
    <ChakraProvider theme={theme}>
      <Grid gap={8}>
        <Header />
        <Main>
          {"markdoc" in pageProps &&
          post &&
          pageProps.markdoc.file.path.startsWith("/blog") ? (
            <BlogLayout meta={post}>
              <Component {...pageProps} />
            </BlogLayout>
          ) : (
            <Component {...pageProps} />
          )}
        </Main>
      </Grid>
    </ChakraProvider>
  );
}

export default MyApp;
