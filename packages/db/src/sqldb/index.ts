import { Kysely, ColumnType, SqliteAdapter, DummyDriver, SqliteIntrospector, SqliteQueryCompiler } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";

/* ------------------------------------------------------------------------------------------------------------
 * Define Tables
 * ------------------------------------------------------------------------------------------------------------ */
export interface IUser {
  id: ColumnType<number, number, never>;
  username: string;
  name: string;
  avatar_url: string;
  github_url: string;
  created_at: ColumnType<string, string | undefined, never>;
  modified_at: ColumnType<string, string | undefined, string>;
}

export interface IRole {
  id: ColumnType<string, string, never>;
  description: string;
  created_at: ColumnType<string, string | undefined, never>;
  modified_at: ColumnType<string, string | undefined, string>;
}

export interface IUserRole {
  user_id: ColumnType<number, number, never>;
  role_id: ColumnType<string, string, never>;
}

export interface IBlog {
  id: ColumnType<string, string, never>;
  title: string;
  description: string;
  cover_img: string;
  body: string;
  views: ColumnType<number, number | undefined, number>;
  published: ColumnType<boolean, boolean | undefined, boolean>;
  published_at: ColumnType<string | null, string | undefined | null, string | null>;
  body_modified_at: ColumnType<string, string | undefined, string>;
  created_at: ColumnType<string, string | undefined, never>;
  modified_at: ColumnType<string, string | undefined, string>;
  author_id: ColumnType<number, number, never>;
}

export interface IBlogTag {
  name: ColumnType<string, string, never>;
  blog_id: ColumnType<string, string, never>;
  created_at: ColumnType<string, string | undefined, never>;
  modified_at: ColumnType<string, string | undefined, string>;
}

export interface IBlogFile {
  id: ColumnType<string, string, never>;
  name: ColumnType<string, string, never>;
  url: ColumnType<string, string, never>;
  size: ColumnType<number, number, never>;
  type: ColumnType<string, string, never>;
  expires_at: ColumnType<string | null, string | null | undefined, string | null>;
  created_at: ColumnType<string, string | undefined, never>;
  modified_at: ColumnType<string, string | undefined, string>;
  blog_id: ColumnType<string, string, never>;
}

/* ------------------------------------------------------------------------------------------------------------
 * Define Database
 * ------------------------------------------------------------------------------------------------------------ */
export interface IDatabase {
  users: IUser;
  roles: IRole;
  user_roles: IUserRole;
  blogs: IBlog;
  blog_tags: IBlogTag;
  blog_files: IBlogFile;
}

export type SqlDbClient = Kysely<IDatabase>;

export function createClient(url: string, authToken: string) {
  return new Kysely<IDatabase>({ dialect: new LibsqlDialect({ url, authToken }) });
}

export const db = new Kysely<IDatabase>({
  dialect: {
    createAdapter: () => new SqliteAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (db) => new SqliteIntrospector(db),
    createQueryCompiler: () => new SqliteQueryCompiler(),
  },
});
