import { ButtonProps, Button, forwardRef } from "@chakra-ui/react";
import { RiGithubFill } from "react-icons/ri";

function login() {
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const authUrl = process.env.NEXT_PUBLIC_AUTH0_URL;
  const callback = process.env.NEXT_PUBLIC_CALLBACK_URL;

  if (!clientId)
    throw new Error("Environment variable `clientId` is not defined.");
  if (!authUrl)
    throw new Error("Environment variable `authUrl` is not defined.");
  if (!callback)
    throw new Error("Environment variable `callback` is not defined.");

  if (typeof window !== "undefined") {
    // build the login url
    const url = new URL(`${authUrl}/authorize`);
    url.searchParams.append("response_type", "token");
    url.searchParams.append("client_id", clientId);
    url.searchParams.append("connection", "github");
    url.searchParams.append("redirect_uri", callback);
    const state = { type: "GITHUB", redirectTo: window.location.href };
    url.searchParams.append("state", JSON.stringify(state));

    // redirect to the login url
    window.location.href = url.toString();
  }
}

export interface SigninButtonProps extends ButtonProps {}

export const SigninButton = forwardRef<SigninButtonProps, "button">(
  (props, ref) => {
    return (
      <Button ref={ref} {...props} leftIcon={<RiGithubFill />} onClick={login}>
        Sign In
      </Button>
    );
  }
);
