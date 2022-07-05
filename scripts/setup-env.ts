import arg from "arg";
import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";
import { writeFile } from "fs/promises";
import path from "path";

async function handler() {
  // get the cli inputs
  const args = arg({ "--region": String, "--env": String });
  if (!args["--region"]) throw new Error("'--region' must be supplied.");
  if (!args["--env"]) args["--env"] = "dev";

  // get the parameters
  const envPath = `/spencerduball/${args["--env"]}`;
  const client = new SSMClient({ region: args["--region"] });
  const command = new GetParametersByPathCommand({
    Path: envPath,
    WithDecryption: true,
  });
  const response = await client.send(command);

  // create an object of the paramters
  const parameters = (response.Parameters || []).reduce(
    (prev: { [key: string]: string }, curr) => {
      let next = { ...prev };
      const regex = new RegExp(`^${envPath}/?`);
      if (curr.Name && curr.Value)
        next[curr.Name.replace(regex, "")] = curr.Value;
      return next;
    },
    {}
  );

  // write the .env to the frontend and backend workspaces
  const fileInfo = Object.entries(parameters).reduce((prev, [name, value]) => {
    if (prev) return prev + "\n" + `${name}=${value}`;
    else return prev + `${name}=${value}`;
  }, "");
  writeFile(path.join(__dirname, "..", "frontend", ".env"), fileInfo);
  writeFile(path.join(__dirname, "..", ".env"), fileInfo);
}

handler();
