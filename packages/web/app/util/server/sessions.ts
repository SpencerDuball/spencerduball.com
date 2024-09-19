import { randomBytes } from "crypto";
import { Selectable, sql } from "kysely";
import { session as sessionCookie } from "./cookies";
import { db, SessionsTable } from "./libsql";
import { getLogger } from "./logger";

export class SessionError extends Error {
  sessionCookie: string;

  constructor(sessionCookie: string) {
    super("There was an error retrieving the session.");
    this.sessionCookie = sessionCookie;
  }

  static async new() {
    return new SessionError(await sessionCookie.serialize(null, { expires: new Date(0) }));
  }
}

/**
 * The UserSession class provides methods for creating, retrieving, refreshing, and
 * destroying user sessions.
 */
export class UserSession {
  /**
   * Creates a new session for the user.
   *
   * @throws {SessionError} If the session could not be created.
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
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((session) => ({
        ...session,
        expires_at: new Date(session.expires_at),
        modified_at: new Date(session.modified_at),
        created_at: new Date(session.created_at),
      }))
      .catch((e) => {
        getLogger().error({ traceId: "7c555595", err: e }, "Failed to create session in database.");
        throw SessionError.new();
      });
    return sessionCookie.serialize(session, { expires: new Date(session.expires_at) });
  }

  /**
   * Retrieves the user's session.
   *
   * This function accepts the "Cookie" header as a string, parses it for the session
   * cookie, and retrieves the session from the database.
   *
   * @throws {SessionError} If the session could not be created.
   * @example
   * ```ts
   *   const user = await UserSession.user({ user_id: user.id });
   * ```
   */
  static async user(cookieHeader: string | null) {
    const session = await sessionCookie.parse(cookieHeader).catch((e) => {
      getLogger().info({ traceId: "8f0f2373", err: e }, "The session was invalid.");
      throw SessionError.new();
    });

    // if there was no session cookie, return null
    if (!session) return null;

    return await db
      .selectFrom("sessions")
      .innerJoin("users", "sessions.user_id", "users.id")
      .where("sessions.id", "=", session.id)
      .leftJoin("user_roles", "users.id", "user_roles.user_id")
      .groupBy("users.id")
      .selectAll("users")
      .select((eb) => eb.fn<string>("json_group_array", ["user_roles.role_id"]).as("roles"))
      .executeTakeFirstOrThrow()
      .then((session) => ({
        ...session,
        modified_at: new Date(session.modified_at),
        created_at: new Date(session.created_at),
        roles: JSON.parse(session.roles) as string[],
      }))
      .catch((e) => {
        getLogger().info({ traceId: "308a2f23", err: e }, "The session was missing or expired.");
        throw SessionError.new();
      });
  }

  /**
   * Returns the session info.
   *
   * This function will throw an error if the session is not parsed correctly.
   */
  static async parse(cookieHeader: string | null) {
    return sessionCookie.parse(cookieHeader).catch((e) => {
      const logger = getLogger();
      logger.info({ traceId: "8f0f2373", err: e }, "The session was invalid.");
      throw SessionError.new();
    });
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
      .set({ expires_at: sql`(datetime('now'))`, modified_at: sql`(datetime('now'))` })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((session) => ({
        ...session,
        expires_at: new Date(session.expires_at),
        modified_at: new Date(session.modified_at),
        created_at: new Date(session.created_at),
      }))
      .catch((e) => {
        getLogger().error({ traceId: "ecc8f525", err: e }, "Failed to refresh session in database.");
        throw SessionError.new();
      });
    return sessionCookie.serialize(session, { expires: new Date(session.expires_at) });
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
  static async destroy(id?: string) {
    if (id) {
      await db
        .deleteFrom("sessions")
        .where("id", "=", id)
        .execute()
        .catch((e) => {
          getLogger().error({ traceId: "57ad5173", err: e }, "Failed to delete session in database.");
        });
    }
    return sessionCookie.serialize(null, { expires: new Date(0) })!;
  }
}
