import { type IKyselyxSources } from "../../kyselyx.config";
import { generate } from "./generate";

async function up({ db }: IKyselyxSources) {
  const { users, roles, user_roles } = await generate();

  await db.insertInto("users").values(users).execute();
  await db.insertInto("roles").values(roles).execute();
  await db.insertInto("user_roles").values(user_roles).execute();
}

async function down({ db }: IKyselyxSources) {
  await db.deleteFrom("user_roles").execute();
  await db.deleteFrom("roles").execute();
  await db.deleteFrom("users").execute();
}

export { up, down };
