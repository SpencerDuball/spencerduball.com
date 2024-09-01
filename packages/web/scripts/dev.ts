import { exec } from "child_process";
import { config } from "@dotenvx/dotenvx";
import path from "path";

// get the path to this file
const __filename = new URL("", import.meta.url).pathname;

async function main() {
  // load the '.env.development' environment variables
  const envPath = path.resolve(__filename, "..", "..", "..", "..", ".env.development");
  config({ path: envPath });

  // run the node server
  // Command to start the dev server
  const command = "NODE_OPTIONS='--enable-source-maps' web-serve | pino-pretty";

  // Execute the command
  const server = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

  // Handle server output
  server.stdout?.on("data", (data) => {
    console.log(data.toString());
  });

  server.stderr?.on("data", (data) => {
    console.error(data.toString());
  });

  // Ensure the child process is terminated when the parent process exits
  process.on("exit", () => {
    server.kill();
  });

  process.on("SIGINT", () => {
    server.kill();
    process.exit();
  });

  process.on("SIGTERM", () => {
    server.kill();
    process.exit();
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    server.kill();
    process.exit(1);
  });
}

main();
