import { Kysely, ColumnType } from "kysely";
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
    id: ColumnType<string, string, never>;
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
    blog_id: ColumnType<string, string, never>;
    created_at: ColumnType<string, string, never>;
    modified_at: ColumnType<string, string, string>;
}
export interface IBlogFile {
    id: ColumnType<string, string, never>;
    name: ColumnType<string, string, never>;
    url: ColumnType<string, string, never>;
    size: ColumnType<number, number, never>;
    type: ColumnType<string, string, never>;
    expires_at: string | null;
    created_at: ColumnType<string, string, never>;
    modified_at: ColumnType<string, string, string>;
    blog_id: ColumnType<string, string, never>;
}
export interface IDatabase {
    users: IUser;
    roles: IRole;
    user_roles: IUserRole;
    blogs: IBlog;
    blog_tags: IBlogTag;
    blog_files: IBlogFile;
}
export type SqlDbClient = Kysely<IDatabase>;
export declare function createClient(url: string, authToken: string): Kysely<IDatabase>;
export declare const db: Kysely<IDatabase>;
