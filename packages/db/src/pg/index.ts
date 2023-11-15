import { Kysely, PostgresDialect, ColumnType } from "kysely";
import { Pool } from "@neondatabase/serverless";

/* ------------------------------------------------------------------------------------------------------------
 * Define Tables
 * ------------------------------------------------------------------------------------------------------------ */
export interface IUser {
  id: ColumnType<number, number, never>;
  username: string;
  name: string;
  avatar_url: string;
  github_url: string;
  created_at: ColumnType<Date, Date | undefined, never>;
  modified_at: ColumnType<Date, Date | undefined, Date>;
}

export interface IRole {
  id: ColumnType<string, string, never>;
  description: string;
  created_at: ColumnType<Date, Date | undefined, never>;
  modified_at: ColumnType<Date, Date | undefined, Date>;
}

export interface IUserRole {
  user_id: ColumnType<number, number, never>;
  role_id: ColumnType<string, string, never>;
}

export interface IBlog {
  id: ColumnType<number, number | undefined, never>;
  title: string;
  description: string;
  image_url: string;
  body: string;
  author_id: number;
  views: ColumnType<number, number | undefined, number>;
  published: ColumnType<boolean, boolean | undefined, boolean>;
  published_at: ColumnType<Date | null, Date | null | undefined, Date | null>;
  body_modified_at: ColumnType<Date, Date | undefined, Date>;
  created_at: ColumnType<Date, Date | undefined, never>;
  modified_at: ColumnType<Date, Date | undefined, Date>;
}

export interface ITag {
  id: ColumnType<string, string, never>;
  created_at: ColumnType<Date, Date | undefined, never>;
  modified_at: ColumnType<Date, Date | undefined, Date>;
}

export interface IBlogTag {
  blog_id: ColumnType<number, number, never>;
  tag_id: ColumnType<string, string, never>;
}

export interface IAttachment {
  id: ColumnType<string, string | undefined, never>;
  size: number;
  type: string;
  url: string;
  blog_id: ColumnType<number | null>;
  is_unused: boolean;
  expires_at: ColumnType<Date | null>;
  created_at: ColumnType<Date, Date | undefined, never>;
  modified_at: ColumnType<Date, Date | undefined, Date>;
}

/* ------------------------------------------------------------------------------------------------------------
 * Define Database
 * ------------------------------------------------------------------------------------------------------------ */
export interface IDatabase {
  users: IUser;
  roles: IRole;
  blogs: IBlog;
  tags: ITag;
  attachments: IAttachment;
  user_roles: IUserRole;
  blog_tags: IBlogTag;
}

export function getClient(connectionString: string) {
  return new Kysely<IDatabase>({
    // TODO: There is a typescript issue where the pg.Pool types are not accurately being transferred.
    // @ts-ignore
    dialect: new PostgresDialect({ pool: new Pool({ connectionString }) }),
  });
}
