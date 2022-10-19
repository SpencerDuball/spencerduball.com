import type { LoaderFunction } from "@remix-run/node";
import type { UserType } from "table";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser } from "~/session.server";
import { SandpackProvider, SandpackThemeProvider, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { vim, Vim } from "@replit/codemirror-vim";
import { cobalt2 } from "@codesandbox/sandpack-themes";
import { Box } from "@chakra-ui/react";

interface LoaderData {
  user: UserType;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json({ user });
};

export default function New() {
  const { user } = useLoaderData<LoaderData>();

  Vim.defineEx("write", "w", () => {
    alert("Yoooo");
  });

  return (
    <>
      <h1>New Blog Post</h1>
      <p>Hello there {user.name}!</p>
      <Box sx={{ "& .cm-panels": { position: "absolute", bottom: 0, left: 0 } }}>
        <SandpackProvider>
          <SandpackThemeProvider theme={cobalt2}>
            <SandpackCodeEditor initMode="immediate" extensions={[vim()]} />
          </SandpackThemeProvider>
        </SandpackProvider>
      </Box>
    </>
  );
}
