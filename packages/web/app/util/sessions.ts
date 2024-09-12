import { session as sessionCookie, flash as flashCookie } from "./cookies";
import { Selectable, sql } from "kysely";
import { db, SessionsTable } from "./libsql";
import { randomBytes } from "crypto";
import { createCookieSessionStorage } from "@remix-run/node";
import { createTypedSessionStorage } from "remix-utils/typed-session";
import { z } from "zod";

/**
 * The UserSession class provides methods for creating, retrieving, refreshing, and
 * destroying user sessions.
 */
export class UserSession {
  /**
   * Creates a new session for the user.
   *
   * @return The session cookie to be sent to the user.
   *
   * @example
   * ```ts
   *   const sessionCookie = await UserSession.new({ user_id: user.id });
   *   return redirect(stateCode.redirect_uri, { headers: [["Set-Cookie", sessionCookie]] });
   * ```
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
      .select([
        "sessions.id as session_id",
        "sessions.expires_at as session_expires_at",
        "sessions.created_at as session_created_at",
        "sessions.modified_at as session_modified_at",
      ])
      .selectAll("users")
      .where("sessions.id", "=", sessionId)
      .executeTakeFirstOrThrow()
      .catch(() => null);
  }

  /**
   * Extends the expiration of the user's session.
   *
   * @param id The session id.
   * @returns The session cookie to be sent to the user.
   *
   * @example
   * ```ts
   *   const session = await UserSession.get(request.headers.get("Cookie"));
   *   const sessionCookie = await UserSession.refresh(session.session_id);
   *   return redirect(stateCode.redirect_uri, { headers: [["Set-Cookie", sessionCookie]] });
   * ```
   */
  static async refresh(id: string) {
    const session = await db
      .updateTable("sessions")
      .set({ expires_at: sql`(datetime('now'))` })
      .where("id", "=", id)
      .returning(["id", "expires_at"])
      .executeTakeFirstOrThrow();
    return sessionCookie.serialize(session.id, { expires: new Date(session.expires_at) });
  }

  /**
   * Destroys the user's session.
   *
   * This function will delete the session from the database and return an empty cookie.
   * This cookie should be sent back as a header so the browser can clear the session.
   *
   * @param id The session id.
   * @returns The session cookie to be sent to the user.
   *
   * @example
   * ```ts
   *   const session = await UserSession.get(request.headers.get("Cookie"));
   *   const sessionCookie = await UserSession.delete(session.session_id);
   *   return redirect(stateCode.redirect_uri, { headers: [["Set-Cookie", sessionCookie]] });
   * ```
   */
  static async destroy(id: string) {
    await db.deleteFrom("sessions").where("id", "=", id).execute();
    return sessionCookie.serialize("", { expires: new Date(0) });
  }
}
