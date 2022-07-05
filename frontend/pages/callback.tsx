import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
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

const githubCallbackSchema = Yup.object({
  access_token: Yup.string().required(),
  token_type: Yup.string().required(),
});

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

    // collect the environment variables
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const authUrl = process.env.NEXT_PUBLIC_AUTH0_URL;
    const callback = process.env.NEXT_PUBLIC_CALLBACK_URL;
    const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

    // ensure environment variables exist
    const message = (name: string) =>
      `Environment variable '${name}' is not defined.`;
    if (!clientId) throw new Error(message("clientId"));
    if (!authUrl) throw new Error(message("authUrl"));
    if (!callback) throw new Error(message("callback"));
    if (!audience) throw new Error(message("audience"));

    // (1) First the user will be directed here from the GITHUB callback
    if (typeof window !== "undefined") {
      if (state.type === "GITHUB") {
        if (!githubCallbackSchema.isValidSync(params))
          throw new Error("Invalid github callback response.");

        // build the login url
        const url = new URL(`${authUrl}/authorize`);
        url.searchParams.append("response_type", "code");
        url.searchParams.append("client_id", clientId);
        url.searchParams.append("redirect_uri", callback);
        url.searchParams.append("audience", audience);
        url.searchParams.append("prompt", "none");
        const nextState = { type: "AUTH0", redirectTo: state.redirectTo };
        url.searchParams.append("state", JSON.stringify(nextState));

        // authorize with auth0
        // axios.get(url.toString(), {
        //   headers: {
        //     Authorization: `${params["token_type"]} ${params["access_token"]}`,
        //   },
        // });
        window.location.href = url.toString();
      }

      // (2) Second the user will be directed here from the AUTH0 PKCE callback
      else if ((state.type = "AUTH0")) {
        // TODO: POST to AWS API, this will POST /oauth/token
        console.log(state);

        // TODO: Save the tokens, setup refresh, etc.
      } else router.push("/");
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
