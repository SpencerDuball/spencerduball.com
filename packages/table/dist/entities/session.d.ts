/// <reference types=".pnpm/ts-toolbelt@6.15.5/node_modules/ts-toolbelt" />
import { Entity, EntityItem } from "dynamodb-toolbox";
import { z } from "zod";
export declare const SessionSchema: {
    readonly name: "Session";
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
        readonly user_id: {
            readonly type: "string";
            readonly required: true;
        };
        readonly ttl: {
            readonly type: "number";
            readonly required: true;
        };
    };
};
export declare const SessionEntity: Entity<undefined, undefined, undefined, "Session", true, true, true, "created", "modified", "entity", {
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
}], "default">, "id" | "created" | "modified" | "entity" | "pk" | "sk" | "ttl" | "user_id", never>, {
    id?: string | undefined;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    ttl: number;
    user_id: string;
}, {
    id?: string | undefined;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    ttl: number;
    user_id: string;
}, {
    pk?: string | undefined;
    sk?: string | undefined;
}>;
export declare type SessionType = EntityItem<typeof SessionEntity>;
export declare const ZSession: z.ZodObject<{
    id: z.ZodString;
    pk: z.ZodString;
    sk: z.ZodString;
    user_id: z.ZodString;
    ttl: z.ZodNumber;
    modified: z.ZodString;
    created: z.ZodString;
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    ttl: number;
    user_id: string;
}, {
    id: string;
    created: string;
    modified: string;
    entity: string;
    pk: string;
    sk: string;
    ttl: number;
    user_id: string;
}>;
//# sourceMappingURL=session.d.ts.map