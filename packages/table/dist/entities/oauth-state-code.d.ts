/// <reference types=".pnpm/ts-toolbelt@6.15.5/node_modules/ts-toolbelt" />
import { Entity, EntityItem } from "dynamodb-toolbox";
import { z } from "zod";
export declare const OAuthStateCodeSchema: {
    readonly name: "OAuthStateCode";
    readonly attributes: {
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
    };
};
export declare const OAuthStateCodeEntity: Entity<undefined, undefined, undefined, "OAuthStateCode", true, true, true, "created", "modified", "entity", {
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
}], "default">, "pk", never, never, "sk", never, never, "pk" | "sk", "modified", "created" | "entity", "id" | "redirect_uri" | "code" | "created" | "modified" | "entity" | "pk" | "sk" | "ttl", never>, {
    id?: string | undefined;
    redirect_uri?: string | undefined;
    code?: string | undefined;
    ttl?: number | undefined;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
}, {
    id?: string | undefined;
    redirect_uri?: string | undefined;
    code?: string | undefined;
    ttl?: number | undefined;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
}, {
    pk?: string | undefined;
    sk?: string | undefined;
}>;
export declare type OAuthStateCodeType = EntityItem<typeof OAuthStateCodeEntity>;
export declare const ZOAuthStateCode: z.ZodObject<{
    id: z.ZodString;
    pk: z.ZodString;
    sk: z.ZodString;
    redirect_uri: z.ZodOptional<z.ZodString>;
    code: z.ZodString;
    ttl: z.ZodNumber;
    modified: z.ZodString;
    created: z.ZodString;
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    redirect_uri?: string | undefined;
    id: string;
    code: string;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    ttl: number;
}, {
    redirect_uri?: string | undefined;
    id: string;
    code: string;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    ttl: number;
}>;
//# sourceMappingURL=oauth-state-code.d.ts.map