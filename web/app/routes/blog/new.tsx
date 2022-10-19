import type { LoaderFunction } from "@remix-run/node";
import type { UserType } from "table";
import { SandpackProvider, SandpackThemeProvider, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { vim, Vim } from "@replit/codemirror-vim";
import { cobalt2 } from "@codesandbox/sandpack-themes";
import { Box } from "@chakra-ui/react";

interface LoaderData {
  user: UserType;
}

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};

export default function New() {
  Vim.defineEx("write", "w", () => {
    alert("Yoooo");
  });

  return (
    <>
      <Box
        sx={{ "& .cm-panels": { position: "absolute", bottom: 0, left: 0 } }}
        minH="full"
        maxH="full"
        overflowY="scroll"
      >
        <SandpackProvider>
          <SandpackThemeProvider theme={cobalt2} style={{ height: "100% !important" }}>
            <SandpackCodeEditor initMode="immediate" extensions={[vim()]} style={{ height: "500px" }} />
          </SandpackThemeProvider>
        </SandpackProvider>
      </Box>
    </>
  );
}
