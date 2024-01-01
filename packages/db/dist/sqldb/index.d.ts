import { Kysely, ColumnType } from "kysely";
export interface IUser {
    id: ColumnType<number, number, never>;
    username: string;
    name: string;
    avatar_url: string;
    github_url: string;
    created_at: ColumnType<Date, Date, never>;
    modified_at: ColumnType<Date, Date, Date>;
}
export interface IRole {
    id: ColumnType<string, string, never>;
    description: string;
    created_at: ColumnType<Date, Date, never>;
    modified_at: ColumnType<Date, Date, Date>;
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
    created_at: ColumnType<Date, Date, never>;
    modified_at: ColumnType<Date, Date, Date>;
    author_id: ColumnType<number, number, never>;
}
export interface IBlogTag {
    name: ColumnType<string, string, never>;
    blog_id: ColumnType<number, number, never>;
    created_at: ColumnType<Date, Date, never>;
    modified_at: ColumnType<Date, Date, Date>;
}
export interface IBlogFile {
    id: ColumnType<number, never, never>;
    name: string;
    url: string;
    alt: string;
    size: ColumnType<number, number, never>;
    type: ColumnType<number, number, never>;
    expires_at: Date | null;
    created_at: ColumnType<Date, Date, never>;
    modified_at: ColumnType<Date, Date, Date>;
    blog_id: ColumnType<number, number, never>;
}
export interface IDatabase {
    users: IUser;
    roles: IRole;
    user_roles: IUserRole;
    blogs: IBlog;
    blog_tags: IBlogTag;
    blog_file: IBlogFile;
}
export type SqlDbClient = Kysely<IDatabase>;
export declare function createClient(url: string, authToken: string): Kysely<IDatabase>;
