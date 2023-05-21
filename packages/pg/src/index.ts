import { Kysely, PostgresDialect, ColumnType } from "kysely";
import pg from "pg";

/* -----------------------------------------------------------------------------------------------------
 * Define Normal Tables
 * ----------------------------------------------------------------------------------------------------- */
interface IUser {
  id: ColumnType<number, number, never>;
  username: string;
  name: string;
  avatar_url: string;
  github_url: string;
  created_at: ColumnType<Date, Date, never>;
  modified_at: Date;
}

interface IRole {
  id: ColumnType<string, string, never>;
  description: string;
  created_at: ColumnType<Date, Date, never>;
  modified_at: Date;
}

interface IBlogPost {
  id: ColumnType<number, number | undefined, never>;
  title: string;
  description: string;
  image_url: string;
  body: string;
  author_id: number;
  views: number;
  published: boolean;
  first_published_at: ColumnType<Date | null, Date | null, Date>;
  content_modified_at: Date;
  created_at: ColumnType<Date, Date, never>;
  modified_at: Date;
}

interface ITag {
  id: ColumnType<string, string, never>;
  created_at: ColumnType<Date, Date, never>;
  modified_at: Date;
}

interface IAttachment {
  id: ColumnType<number, number | undefined, never>;
  size: number;
  type: string;
  url: string;
  blogpost_id: ColumnType<number | null>;
  is_unused: boolean;
  expires_at: ColumnType<Date | null>;
  created_at: ColumnType<Date, Date, never>;
  modified_at: Date;
}

/* -----------------------------------------------------------------------------------------------------
 * Define Linker Tables
 * ----------------------------------------------------------------------------------------------------- */
interface IUserRole {
  user_id: ColumnType<number, number, never>;
  role_id: ColumnType<string, string, never>;
}

interface IBlogPostTag {
  blogpost_id: ColumnType<number, number, never>;
  tag_id: ColumnType<string, string, never>;
}

/* -----------------------------------------------------------------------------------------------------
 * Define Database
 * ----------------------------------------------------------------------------------------------------- */
interface IDatabase {
  users: IUser;
  roles: IRole;
  blogposts: IBlogPost;
  tags: ITag;
  attachments: IAttachment;
  user_roles: IUserRole;
  blogpost_tags: IBlogPostTag;
}

function getClient(connectionUrl: string) {
  return new Kysely<IDatabase>({
    dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString: connectionUrl }) }),
  });
}

export { getClient };
export type { IUser, IRole, IBlogPost, ITag, IAttachment, IUserRole, IBlogPostTag, IDatabase };
