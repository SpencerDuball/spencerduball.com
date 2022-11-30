/// <reference types=".pnpm/ts-toolbelt@6.15.5/node_modules/ts-toolbelt" />
import * as DynamoDB from "aws-sdk/clients/dynamodb";
import { Table as DdbTable, Entity } from "dynamodb-toolbox";
export declare class Table {
    table: DdbTable<string, "pk", "sk">;
    entities: {
        user: Entity<undefined, undefined, undefined, "User", true, true, true, "created", "modified", "entity", {
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly username: {
                readonly type: "string";
                readonly required: true;
            };
            readonly name: {
                readonly type: "string";
                readonly required: true;
            };
            readonly avatar_url: {
                readonly type: "string";
            };
            readonly github_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly roles: {
                readonly type: "list";
            };
            readonly permissions: {
                readonly type: "list";
            };
        }, import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly username: {
                readonly type: "string";
                readonly required: true;
            };
            readonly name: {
                readonly type: "string";
                readonly required: true;
            };
            readonly avatar_url: {
                readonly type: "string";
            };
            readonly github_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly roles: {
                readonly type: "list";
            };
            readonly permissions: {
                readonly type: "list";
            };
        }>, import("dynamodb-toolbox/dist/classes/Entity").ParseAttributes<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly username: {
                readonly type: "string";
                readonly required: true;
            };
            readonly name: {
                readonly type: "string";
                readonly required: true;
            };
            readonly avatar_url: {
                readonly type: "string";
            };
            readonly github_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly roles: {
                readonly type: "list";
            };
            readonly permissions: {
                readonly type: "list";
            };
        }>, true, "created", "modified", "entity", "created" | "modified" | "entity", "created" | "modified" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly username: {
                readonly type: "string";
                readonly required: true;
            };
            readonly name: {
                readonly type: "string";
                readonly required: true;
            };
            readonly avatar_url: {
                readonly type: "string";
            };
            readonly github_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly roles: {
                readonly type: "list";
            };
            readonly permissions: {
                readonly type: "list";
            };
        }>, {
            default: any;
        } | [any, any, {
            default: any;
        }], "default">, "pk", never, never, "sk", never, never, "pk" | "sk", "modified", "created" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly username: {
                readonly type: "string";
                readonly required: true;
            };
            readonly name: {
                readonly type: "string";
                readonly required: true;
            };
            readonly avatar_url: {
                readonly type: "string";
            };
            readonly github_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly roles: {
                readonly type: "list";
            };
            readonly permissions: {
                readonly type: "list";
            };
        }>, {
            required: true;
        } | [any, any, {
            required: true;
        }], "default">, "created" | "pk" | "sk" | "id" | "modified" | "entity" | "username" | "name" | "avatar_url" | "github_url" | "roles" | "permissions", never>, {
            avatar_url?: string | undefined;
            roles?: any[] | undefined;
            permissions?: any[] | undefined;
            created: string;
            pk: string;
            sk: string;
            id: string;
            modified: string;
            entity: string;
            username: string;
            name: string;
            github_url: string;
        }, {
            avatar_url?: string | undefined;
            roles?: any[] | undefined;
            permissions?: any[] | undefined;
            created: string;
            pk: string;
            sk: string;
            id: string;
            modified: string;
            entity: string;
            username: string;
            name: string;
            github_url: string;
        }, {
            pk?: string | undefined;
            sk?: string | undefined;
        }>;
        oAuthStateCode: Entity<undefined, undefined, undefined, "OAuthStateCode", true, true, true, "created", "modified", "entity", {
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly redirect_uri: {
                readonly type: "string";
            };
            readonly code: {
                readonly type: "string";
                readonly default: (data: any) => string;
            };
            readonly ttl: {
                readonly type: "number";
                readonly default: () => number;
            };
        }, import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly redirect_uri: {
                readonly type: "string";
            };
            readonly code: {
                readonly type: "string";
                readonly default: (data: any) => string;
            };
            readonly ttl: {
                readonly type: "number";
                readonly default: () => number;
            };
        }>, import("dynamodb-toolbox/dist/classes/Entity").ParseAttributes<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly redirect_uri: {
                readonly type: "string";
            };
            readonly code: {
                readonly type: "string";
                readonly default: (data: any) => string;
            };
            readonly ttl: {
                readonly type: "number";
                readonly default: () => number;
            };
        }>, true, "created", "modified", "entity", "created" | "modified" | "entity", "created" | "modified" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly redirect_uri: {
                readonly type: "string";
            };
            readonly code: {
                readonly type: "string";
                readonly default: (data: any) => string;
            };
            readonly ttl: {
                readonly type: "number";
                readonly default: () => number;
            };
        }>, {
            default: any;
        } | [any, any, {
            default: any;
        }], "default">, "pk", never, never, "sk", never, never, "pk" | "sk", "modified", "created" | "entity", "created" | "pk" | "sk" | "id" | "code" | "modified" | "entity" | "redirect_uri" | "ttl", never>, {
            id?: string | undefined;
            code?: string | undefined;
            redirect_uri?: string | undefined;
            ttl?: number | undefined;
            created: string;
            pk: string;
            sk: string;
            modified: string;
            entity: string;
        }, {
            id?: string | undefined;
            code?: string | undefined;
            redirect_uri?: string | undefined;
            ttl?: number | undefined;
            created: string;
            pk: string;
            sk: string;
            modified: string;
            entity: string;
        }, {
            pk?: string | undefined;
            sk?: string | undefined;
        }>;
        session: Entity<undefined, undefined, undefined, "Session", true, true, true, "created", "modified", "entity", {
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly user_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly ttl: {
                readonly type: "number";
                readonly required: true;
            };
        }, import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly user_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly ttl: {
                readonly type: "number";
                readonly required: true;
            };
        }>, import("dynamodb-toolbox/dist/classes/Entity").ParseAttributes<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly user_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly ttl: {
                readonly type: "number";
                readonly required: true;
            };
        }>, true, "created", "modified", "entity", "created" | "modified" | "entity", "created" | "modified" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly user_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly ttl: {
                readonly type: "number";
                readonly required: true;
            };
        }>, {
            default: any;
        } | [any, any, {
            default: any;
        }], "default">, "pk", never, never, "sk", never, never, "pk" | "sk", "modified", "created" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly user_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly ttl: {
                readonly type: "number";
                readonly required: true;
            };
        }>, {
            required: true;
        } | [any, any, {
            required: true;
        }], "default">, "created" | "pk" | "sk" | "id" | "modified" | "entity" | "ttl" | "user_id", never>, {
            id?: string | undefined;
            created: string;
            pk: string;
            sk: string;
            modified: string;
            entity: string;
            ttl: number;
            user_id: string;
        }, {
            id?: string | undefined;
            created: string;
            pk: string;
            sk: string;
            modified: string;
            entity: string;
            ttl: number;
            user_id: string;
        }, {
            pk?: string | undefined;
            sk?: string | undefined;
        }>;
        blog: Entity<undefined, undefined, undefined, "Blog", true, true, true, "created", "modified", "entity", {
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly title: {
                readonly type: "string";
                readonly required: true;
            };
            readonly image_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly tags: {
                readonly type: "list";
            };
            readonly s3_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly author_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly views: {
                readonly type: "number";
                readonly default: 0;
            };
            readonly content_modified: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    created: string;
                }) => string;
            };
            readonly published: {
                readonly type: "boolean";
                readonly default: false;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly gsi1pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi1sk: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    created: string; /** Index to search for items in a collection, sorted by published status + number of views.
                     * @example { pk: "blog", sk: "published#<true|false>#views#<views>#blog#<blog_id>" }
                     */
                }) => string;
            };
            readonly gsi2pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi2sk: {
                readonly type: "string";
                readonly dependsOn: "views";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    views: number;
                }) => string;
            };
        }, import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly title: {
                readonly type: "string";
                readonly required: true;
            };
            readonly image_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly tags: {
                readonly type: "list";
            };
            readonly s3_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly author_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly views: {
                readonly type: "number";
                readonly default: 0;
            };
            readonly content_modified: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    created: string;
                }) => string;
            };
            readonly published: {
                readonly type: "boolean";
                readonly default: false;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly gsi1pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi1sk: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    created: string; /** Index to search for items in a collection, sorted by published status + number of views.
                     * @example { pk: "blog", sk: "published#<true|false>#views#<views>#blog#<blog_id>" }
                     */
                }) => string;
            };
            readonly gsi2pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi2sk: {
                readonly type: "string";
                readonly dependsOn: "views";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    views: number;
                }) => string;
            };
        }>, import("dynamodb-toolbox/dist/classes/Entity").ParseAttributes<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly title: {
                readonly type: "string";
                readonly required: true;
            };
            readonly image_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly tags: {
                readonly type: "list";
            };
            readonly s3_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly author_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly views: {
                readonly type: "number";
                readonly default: 0;
            };
            readonly content_modified: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    created: string;
                }) => string;
            };
            readonly published: {
                readonly type: "boolean";
                readonly default: false;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly gsi1pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi1sk: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    created: string; /** Index to search for items in a collection, sorted by published status + number of views.
                     * @example { pk: "blog", sk: "published#<true|false>#views#<views>#blog#<blog_id>" }
                     */
                }) => string;
            };
            readonly gsi2pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi2sk: {
                readonly type: "string";
                readonly dependsOn: "views";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    views: number;
                }) => string;
            };
        }>, true, "created", "modified", "entity", "created" | "modified" | "entity", "created" | "modified" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly title: {
                readonly type: "string";
                readonly required: true;
            };
            readonly image_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly tags: {
                readonly type: "list";
            };
            readonly s3_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly author_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly views: {
                readonly type: "number";
                readonly default: 0;
            };
            readonly content_modified: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    created: string;
                }) => string;
            };
            readonly published: {
                readonly type: "boolean";
                readonly default: false;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly gsi1pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi1sk: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    created: string; /** Index to search for items in a collection, sorted by published status + number of views.
                     * @example { pk: "blog", sk: "published#<true|false>#views#<views>#blog#<blog_id>" }
                     */
                }) => string;
            };
            readonly gsi2pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi2sk: {
                readonly type: "string";
                readonly dependsOn: "views";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    views: number;
                }) => string;
            };
        }>, {
            default: any;
        } | [any, any, {
            default: any;
        }], "default">, "pk", never, never, "sk", never, never, "pk" | "sk", "modified", "created" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
            readonly id: {
                readonly type: "string";
                readonly default: () => string;
            };
            readonly title: {
                readonly type: "string";
                readonly required: true;
            };
            readonly image_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly tags: {
                readonly type: "list";
            };
            readonly s3_url: {
                readonly type: "string";
                readonly required: true;
            };
            readonly author_id: {
                readonly type: "string";
                readonly required: true;
            };
            readonly views: {
                readonly type: "number";
                readonly default: 0;
            };
            readonly content_modified: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    created: string;
                }) => string;
            };
            readonly published: {
                readonly type: "boolean";
                readonly default: false;
            };
            readonly pk: {
                readonly partitionKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly sk: {
                readonly sortKey: true;
                readonly type: "string";
                readonly default: (data: {
                    id: string;
                }) => string;
            };
            readonly gsi1pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi1sk: {
                readonly type: "string";
                readonly dependsOn: "created";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    created: string; /** Index to search for items in a collection, sorted by published status + number of views.
                     * @example { pk: "blog", sk: "published#<true|false>#views#<views>#blog#<blog_id>" }
                     */
                }) => string;
            };
            readonly gsi2pk: {
                readonly type: "string";
                readonly default: "blog";
            };
            readonly gsi2sk: {
                readonly type: "string";
                readonly dependsOn: "views";
                readonly default: (data: {
                    id: string;
                    published: boolean;
                    views: number;
                }) => string;
            };
        }>, {
            required: true;
        } | [any, any, {
            required: true;
        }], "default">, "created" | "views" | "pk" | "sk" | "gsi1pk" | "gsi1sk" | "gsi2pk" | "gsi2sk" | "id" | "title" | "image_url" | "tags" | "s3_url" | "author_id" | "content_modified" | "published" | "modified" | "entity", never>, {
            views?: number | undefined;
            gsi1pk?: string | undefined;
            gsi1sk?: string | undefined;
            gsi2pk?: string | undefined;
            gsi2sk?: string | undefined;
            id?: string | undefined;
            tags?: any[] | undefined;
            content_modified?: string | undefined;
            published?: boolean | undefined;
            created: string;
            pk: string;
            sk: string;
            title: string;
            image_url: string;
            s3_url: string;
            author_id: string;
            modified: string;
            entity: string;
        }, {
            views?: number | undefined;
            gsi1pk?: string | undefined;
            gsi1sk?: string | undefined;
            gsi2pk?: string | undefined;
            gsi2sk?: string | undefined;
            id?: string | undefined;
            tags?: any[] | undefined;
            content_modified?: string | undefined;
            published?: boolean | undefined;
            created: string;
            pk: string;
            sk: string;
            title: string;
            image_url: string;
            s3_url: string;
            author_id: string;
            modified: string;
            entity: string;
        }, {
            pk?: string | undefined;
            sk?: string | undefined;
        }>;
    };
    constructor(props: {
        tableName: string;
        client: DynamoDB.DocumentClient;
    });
}
export * from "./entities";
//# sourceMappingURL=index.d.ts.map