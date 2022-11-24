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
        }>, true, "created", "modified", "entity", "modified" | "created" | "entity", "modified" | "created" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
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
        }], "default">, "id" | "pk" | "sk" | "modified" | "created" | "entity" | "username" | "name" | "avatar_url" | "github_url" | "roles" | "permissions", never>, {
            avatar_url?: string | undefined;
            roles?: any[] | undefined;
            permissions?: any[] | undefined;
            id: string;
            pk: string;
            sk: string;
            modified: string;
            created: string;
            entity: string;
            username: string;
            name: string;
            github_url: string;
        }, {
            avatar_url?: string | undefined;
            roles?: any[] | undefined;
            permissions?: any[] | undefined;
            id: string;
            pk: string;
            sk: string;
            modified: string;
            created: string;
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
                readonly type: "string"; /** Index to search for items in a collection, sorted by published status + creation time.
                 * @example { pk: "blog", sk: "published#<true|false>#created#<created>#blog#<blog_id>" }
                 * @example { pk: "blog#<blog_id>", sk: "created#<created>#comment#<comment_id>"}
                 */
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
                readonly type: "string"; /** Index to search for items in a collection, sorted by published status + creation time.
                 * @example { pk: "blog", sk: "published#<true|false>#created#<created>#blog#<blog_id>" }
                 * @example { pk: "blog#<blog_id>", sk: "created#<created>#comment#<comment_id>"}
                 */
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
                readonly type: "string"; /** Index to search for items in a collection, sorted by published status + creation time.
                 * @example { pk: "blog", sk: "published#<true|false>#created#<created>#blog#<blog_id>" }
                 * @example { pk: "blog#<blog_id>", sk: "created#<created>#comment#<comment_id>"}
                 */
                readonly default: (data: any) => string;
            };
            readonly ttl: {
                readonly type: "number";
                readonly default: () => number;
            };
        }>, true, "created", "modified", "entity", "modified" | "created" | "entity", "modified" | "created" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
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
                readonly type: "string"; /** Index to search for items in a collection, sorted by published status + creation time.
                 * @example { pk: "blog", sk: "published#<true|false>#created#<created>#blog#<blog_id>" }
                 * @example { pk: "blog#<blog_id>", sk: "created#<created>#comment#<comment_id>"}
                 */
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
        }], "default">, "pk", never, never, "sk", never, never, "pk" | "sk", "modified", "created" | "entity", "id" | "redirect_uri" | "code" | "pk" | "sk" | "ttl" | "modified" | "created" | "entity", never>, {
            id?: string | undefined;
            redirect_uri?: string | undefined;
            code?: string | undefined;
            ttl?: number | undefined;
            pk: string;
            sk: string;
            modified: string;
            created: string;
            entity: string;
        }, {
            id?: string | undefined;
            redirect_uri?: string | undefined;
            code?: string | undefined;
            ttl?: number | undefined;
            pk: string;
            sk: string;
            modified: string;
            created: string;
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
        }>, true, "created", "modified", "entity", "modified" | "created" | "entity", "modified" | "created" | "entity" | import("Object/SelectKeys")._SelectKeys<import("dynamodb-toolbox/dist/classes/Entity").Writable<{
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
        }], "default">, "id" | "pk" | "sk" | "ttl" | "modified" | "created" | "entity" | "user_id", never>, {
            id?: string | undefined;
            pk: string;
            sk: string;
            ttl: number;
            modified: string;
            created: string;
            entity: string;
            user_id: string;
        }, {
            id?: string | undefined;
            pk: string;
            sk: string;
            ttl: number;
            modified: string;
            created: string;
            entity: string;
            user_id: string;
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