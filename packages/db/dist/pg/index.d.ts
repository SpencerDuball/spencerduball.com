import { Kysely, ColumnType } from "kysely";
export interface IUser {
    id: ColumnType<number, number, never>;
    username: string;
    name: string;
    avatar_url: string;
    github_url: string;
    created_at: ColumnType<Date, Date, never>;
    modified_at: Date;
}
export interface IRole {
    id: ColumnType<string, string, never>;
    description: string;
    created_at: ColumnType<Date, Date, never>;
    modified_at: Date;
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
    views: number;
    published: boolean;
    published_at: ColumnType<Date | null, Date | null, Date>;
    body_modified_at: Date;
    created_at: ColumnType<Date, Date, never>;
    modified_at: Date;
}
export interface ITag {
    id: ColumnType<string, string, never>;
    created_at: ColumnType<Date, Date, never>;
    modified_at: Date;
}
export interface IBlogTag {
    blog_id: ColumnType<number, number, never>;
    tag_id: ColumnType<string, string, never>;
}
export interface IAttachment {
    id: ColumnType<number, number | undefined, never>;
    size: number;
    type: string;
    url: string;
    blog_id: ColumnType<number | null>;
    is_unused: boolean;
    expires_at: ColumnType<Date | null>;
    created_at: ColumnType<Date, Date, never>;
    modified_at: Date;
}
export interface IDatabase {
    users: IUser;
    roles: IRole;
    blogs: IBlog;
    tags: ITag;
    attachments: IAttachment;
    user_roles: IUserRole;
    blog_tags: IBlogTag;
}
export declare function getClient(connectionUrl: string): Kysely<IDatabase>;
