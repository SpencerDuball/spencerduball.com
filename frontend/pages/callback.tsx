import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Spinner,
} from "@chakra-ui/react";
import { useEffect } from "react";
import * as Yup from "yup";

function extractParams(search: string) {
  return Object.fromEntries(
    new URLSearchParams(search.replace(/^#/, "")).entries()
  );
}

const stateSchema = Yup.object({
  type: Yup.string().required(),
  redirectTo: Yup.string().defined(),
});

const useHandleLogin = () => {
  const router = useRouter();

  useEffect(() => {
    // extract the search params
    let params = extractParams(
      location.search ? location.search : location.hash
    );

    // get the data from "state" param
    const state = JSON.parse(params.state);
    if (!stateSchema.isValidSync(state)) router.push("/");

    // (1) First the user will be directed here from the GITHUB callback
    if (state.type === "GITHUB") {
      // TODO: GET /authorize to the Auth0
      console.log(state);
    }

    // (2) Second the user will be directed here from the AUTH0 PKCE callback
    else if ((state.type = "AUTH0")) {
      // TODO: POST to AWS API, this will POST /oauth/token
      console.log(state);

      // TODO: Save the tokens, setup refresh, etc.
    } else router.push("/");
  }, []);
};

const Home: NextPage = () => {
  useHandleLogin();

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Modal onClose={() => {}} isOpen isCentered>
        <ModalOverlay />
        <ModalContent w="min-content">
          <ModalBody display="grid">
            <Spinner colorScheme="teal" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Home;
