import { Config } from "sst/node/config";
import prompts from "prompts";
import { getClient } from "../src";
import prettier from "prettier";

interface AddRoleToUserParams {
  userId: number;
  roleId: string;
}
async function addRoleToUser({ userId, roleId }: AddRoleToUserParams) {
  // create the connection
  const db = getClient(Config.DATABASE_URL);

  // add the user role
  console.log(`Adding role "${roleId}" to user "${userId}" ...`);
  await db
    .insertInto("user_roles")
    .values({ user_id: userId, role_id: roleId })
    .execute()
    .catch((e) => {
      console.error("There was an issue adding the role to the user:");
      console.error(e);
      process.exit();
    });
  console.log(`Success: Added role "${roleId}" to user "${userId}"`);

  await db.destroy();
}

interface GetUserFromUsername {
  username: string;
}
async function userFromUsername({ username }: GetUserFromUsername) {
  // create the connection
  const db = getClient(Config.DATABASE_URL);

  // add the user role
  console.log(`Getting user from "${username}" ...`);
  const userInfo = await db
    .selectFrom("users")
    .where("users.username", "=", username)
    .selectAll()
    .executeTakeFirstOrThrow()
    .catch((e) => {
      console.log(`Could not find a user with username: "${username}"`);
    });
  console.log(`Success: Found user with username "${username}"`);

  // print the userInfo
  console.log(prettier.format(JSON.stringify(userInfo), { parser: "json" }));

  await db.destroy();
}

async function main() {
  // if running on "prod" confirm this action with the user
  if (Config.STAGE === "prod") {
    const { shouldRunOnProd } = await prompts({
      type: "confirm",
      name: "shouldRunOnProd",
      message: "You are attempting to run this action on the production database, are you sure?",
    });
    if (!shouldRunOnProd) {
      console.log("Aborted the action attempted for the 'prod' database.");
      process.exit();
    }
  }

  // prompt the user for the action to perform
  const { action } = await prompts({
    type: "select",
    name: "action",
    message: "Select an action:",
    choices: [
      { title: "Add role to user", value: "add-role-to-user" },
      { title: "Get user from username", value: "user-from-username" },
    ],
  });

  if (action === "add-role-to-user") {
    const { userId, roleId } = await prompts([
      { type: "number", name: "userId", message: "User ID:" },
      { type: "text", name: "roleId", message: "Role ID:" },
    ]);
    await addRoleToUser({ userId, roleId });
  } else if (action === "user-from-username") {
    const { username } = await prompts([{ type: "text", name: "username", message: "Username: " }]);
    await userFromUsername({ username });
  }
}

main();
