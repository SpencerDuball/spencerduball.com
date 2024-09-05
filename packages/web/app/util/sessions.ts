import { session as sessionCookie } from "./cookies";
import { Selectable, sql } from "kysely";
import { db, SessionsTable } from "./libsql";
import { randomBytes } from "crypto";

export class UserSession {
  /**
   * Creates a new session for the user.
   */
  static async new({ user_id }: Pick<Selectable<SessionsTable>, "user_id">) {
    const session = await db
      .insertInto("sessions")
      .values({ id: randomBytes(16).toString("hex"), user_id })
      .returning(["id", "expires_at"])
      .executeTakeFirstOrThrow();
    return sessionCookie.serialize(session.id, { expires: new Date(session.expires_at) });
  }

  /**
   * Retrieves the user's session.
   *
   * This function accepts the "Cookie" header as a string, parses it for the session
   * cookie, and retrieves the session from the database.
   */
  static async get(cookeHeader: string | null) {
    const sessionId = await sessionCookie.parse(cookeHeader);
    if (!sessionId) return null;
    return await db
      .selectFrom("sessions")
      .innerJoin("users", "sessions.user_id", "users.id")
      .select("sessions.id as session_id")
      .selectAll("users")
      .where("sessions.id", "=", sessionId)
      .executeTakeFirstOrThrow()
      .catch(() => null);
  }

  /**
   * Extends the expiration of the user's session.
   */
  static async refresh(id: string) {
    const session = await db
      .updateTable("sessions")
      .set({ expires_at: sql`(datetime('now'))` })
      .where("id", "=", id)
      .returning(["id", "expires_at"])
      .executeTakeFirst();
    if (!session) return null;
    return sessionCookie.serialize(session.id, { expires: new Date(session.expires_at) });
  }

  /**
   * Destroys the user's session.
   *
   * This function will delete the session from the database and return an empty cookie.
   * This cookie should be sent back as a header so the browser can clear the session.
   */
  static async destroy(id: string) {
    await db.deleteFrom("sessions").where("id", "=", id).execute();
    return sessionCookie.serialize("", { expires: new Date(0) });
  }
}
