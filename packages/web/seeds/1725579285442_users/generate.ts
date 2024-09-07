import { faker } from "@faker-js/faker";
import { Selectable } from "kysely";
import { UsersTable } from "~/util/libsql";

faker.seed(70487); // seed for predictable randomness, can be any number

// -------------------------------------------------------------------------------------
// Define Factories
// -------------------------------------------------------------------------------------

interface IUsersGeneratorProps {
  /**
   * The reference (initial) date to generate the users.
   */
  refDate: Date;
  /**
   * The range of days from the refDate to generate the user.
   */
  days?: number;
}

/**
 * Generates a random user.
 *
 * Each user is generated in cronological order, the `days` parameter is used to
 * generate the user in a specific range of days from the `refDate`.
 */
export function* usersGenerator({
  refDate: _refDate,
  days,
}: IUsersGeneratorProps): Generator<Selectable<UsersTable>, never> {
  let refDate = _refDate;

  while (true) {
    // create the user data
    const githubAvatar = faker.image.avatarGitHub();

    const githubId = parseInt(/(?<github_id>\d+)$/.exec(githubAvatar)!.groups!.github_id);

    const first = faker.person.firstName();
    const last = faker.person.lastName();

    const id = faker.string.uuid();
    const github_id = githubId;
    const username = `${first}_${last}`;
    const name = `${first} ${last}`;
    const avatar_url = githubAvatar;
    const github_url = `https://github.com/${username}`;
    const created_at = faker.date.soon({ refDate, days });
    const modified_at = faker.date.soon({ refDate: created_at, days: 30 });

    // update the `refDate` for the next iteration
    refDate = created_at;

    yield {
      id,
      github_id,
      username,
      name,
      avatar_url,
      github_url,
      created_at: created_at.toISOString(),
      modified_at: modified_at.toISOString(),
    };
  }
}

// -------------------------------------------------------------------------------------
// Define Main
// -------------------------------------------------------------------------------------

export async function generate() {
  const refDate = faker.date.past({ years: 5 });

  // create the users
  const createUser = usersGenerator({ refDate, days: 10 });
  const users = Array.from({ length: faker.number.int({ min: 2000, max: 4000 }) }).map(() => createUser.next().value);

  // create the roles
  const roles = [{ id: "admin", description: "The administrator role.", created_at: faker.date.past() }];

  // create the user_roles (assign the admin role to 10 random users)
  const user_roles = Array.from({ length: 10 }).map(() => ({
    user_id: faker.helpers.arrayElement(users).id,
    role_id: "admin",
  }));

  return { users, roles, user_roles };
}
