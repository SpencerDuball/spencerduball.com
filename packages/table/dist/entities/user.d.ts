/// <reference types=".pnpm/ts-toolbelt@6.15.5/node_modules/ts-toolbelt" />
import { Entity, EntityItem } from "dynamodb-toolbox";
import { z } from "zod";
export declare const UserSchema: {
    readonly name: "User";
    readonly attributes: {
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
    };
};
export declare const UserEntity: Entity<undefined, undefined, undefined, "User", true, true, true, "created", "modified", "entity", {
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
}], "default">, "id" | "created" | "modified" | "entity" | "pk" | "sk" | "username" | "name" | "avatar_url" | "github_url" | "roles" | "permissions", never>, {
    avatar_url?: string | undefined;
    roles?: any[] | undefined;
    permissions?: any[] | undefined;
    id: string;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    username: string;
    name: string;
    github_url: string;
}, {
    avatar_url?: string | undefined;
    roles?: any[] | undefined;
    permissions?: any[] | undefined;
    id: string;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    username: string;
    name: string;
    github_url: string;
}, {
    pk?: string | undefined;
    sk?: string | undefined;
}>;
export declare type UserEntityType = EntityItem<typeof UserEntity>;
export declare const ZUserEntity: z.ZodObject<{
    pk: z.ZodString;
    sk: z.ZodString;
    id: z.ZodString;
    username: z.ZodString;
    name: z.ZodString;
    avatar_url: z.ZodOptional<z.ZodString>;
    github_url: z.ZodString;
    roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    modified: z.ZodString;
    created: z.ZodString;
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    avatar_url?: string | undefined;
    roles?: string[] | undefined;
    permissions?: string[] | undefined;
    id: string;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    username: string;
    name: string;
    github_url: string;
}, {
    avatar_url?: string | undefined;
    roles?: string[] | undefined;
    permissions?: string[] | undefined;
    id: string;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    username: string;
    name: string;
    github_url: string;
}>;
//# sourceMappingURL=user.d.ts.map