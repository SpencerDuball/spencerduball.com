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
  created_at: ColumnType<string, string, never>;
  modified_at: ColumnType<string, string, string>;
}

export interface IRole {
  id: ColumnType<string, string, never>;
  description: string;
  created_at: ColumnType<string, string, never>;
  modified_at: ColumnType<string, string, string>;
}

export interface IUserRole {
  user_id: ColumnType<number, number, never>;
  role_id: ColumnType<string, string, never>;
}

export interface IBlog {
  id: ColumnType<number, never, never>;
  title: string;
  description: string;
  cover_img: string;
  body: string;
  views: number;
  published: boolean;
  published_at: string | null;
  body_modified_at: string;
  created_at: ColumnType<string, string, never>;
  modified_at: ColumnType<string, string, string>;
  author_id: ColumnType<number, number, never>;
}

export interface IBlogTag {
  name: ColumnType<string, string, never>;
  blog_id: ColumnType<number, number, never>;
  created_at: ColumnType<string, string, never>;
  modified_at: ColumnType<string, string, string>;
}

export interface IBlogFile {
  id: ColumnType<number, never, never>;
  name: string;
  url: string;
  alt: string;
  size: ColumnType<number, number, never>;
  type: ColumnType<number, number, never>;
  expires_at: string | null;
  created_at: ColumnType<string, string, never>;
  modified_at: ColumnType<string, string, string>;
  blog_id: ColumnType<number, number, never>;
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
  blog_file: IBlogFile;
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
