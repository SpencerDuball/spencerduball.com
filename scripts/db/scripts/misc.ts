import ora from "ora";
import { getDbClient } from "../lib";
import SQLite from "better-sqlite3";

/**
 * This function will reset the database to it's original state. Everything will be removed including migration info,
 * and seed data.
 */
export async function reset() {
  let spinner = ora("Connecting to the database ...").start();

  // create the connection
  const db = getDbClient();

  // PART 1: Reset the SQL Database
  // ------------------------------
  // To drop all tables in the database we need to turn the 'foreign_keys' checks off and then delete all the tables in
  // a single executing command string. We can't use the Kysely package because:
  //
  // 1. Multiple statements cannot be sent at once in a single query. This is an issue because the 'foreign_keys' pragma
  //    gets reset right after a query finishes.
  // 2. We can't use transactions with Kysely to ensure PRAGMA is turned off because Kysely will not allow PRAGMA in a
  //    transaction (might be a SQL restriction too, not sure).
  spinner.text = `Dropping all tables from sql database ...`;
}
