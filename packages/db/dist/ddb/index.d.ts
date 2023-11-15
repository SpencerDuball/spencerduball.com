import { Table, Entity } from "dynamodb-toolbox";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
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
        readonly gsi1pk: {
            readonly type: "string";
            readonly dependsOn: "user_id";
            readonly default: (data: {
                user_id: string;
            }) => string;
        };
        readonly gsi1sk: {
            readonly type: "string";
            readonly dependsOn: "id";
            readonly default: (data: {
                pk: string;
            }) => string;
        };
        readonly user_id: {
            readonly type: "number";
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
        readonly ttl: {
            readonly type: "number";
            readonly required: true;
        };
    };
};
export declare const ZSession: z.ZodObject<{
    id: z.ZodString;
    pk: z.ZodString;
    sk: z.ZodString;
    user_id: z.ZodNumber;
    username: z.ZodString;
    name: z.ZodString;
    avatar_url: z.ZodOptional<z.ZodString>;
    github_url: z.ZodString;
    roles: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], unknown>;
    ttl: z.ZodNumber;
    modified: z.ZodString;
    created: z.ZodString;
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    username: string;
    created: string;
    modified: string;
    entity: string;
    user_id: number;
    id: string;
    pk: string;
    sk: string;
    github_url: string;
    roles: string[];
    ttl: number;
    avatar_url?: string | undefined;
}, {
    name: string;
    username: string;
    created: string;
    modified: string;
    entity: string;
    user_id: number;
    id: string;
    pk: string;
    sk: string;
    github_url: string;
    ttl: number;
    avatar_url?: string | undefined;
    roles?: unknown;
}>;
export type SessionType = z.infer<typeof ZSession>;
export declare const ZCode: z.ZodObject<{
    id: z.ZodString;
    redirectUri: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    redirectUri?: string | undefined;
}, {
    id: string;
    redirectUri?: string | undefined;
}>;
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
            readonly dependsOn: readonly ["id", "redirect_uri"];
            readonly default: (data: {
                id: string;
                redirect_uri?: string;
            }) => string;
        };
        readonly ttl: {
            readonly type: "number";
            readonly default: () => number;
        };
    };
};
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
    code: string;
    created: string;
    modified: string;
    entity: string;
    id: string;
    pk: string;
    sk: string;
    ttl: number;
    redirect_uri?: string | undefined;
}, {
    code: string;
    created: string;
    modified: string;
    entity: string;
    id: string;
    pk: string;
    sk: string;
    ttl: number;
    redirect_uri?: string | undefined;
}>;
export type OAuthStateCodeType = ReturnType<typeof ZOAuthStateCode.parse>;
export declare const OAuthMockSchema: {
    readonly name: "OAuthMock";
    readonly attributes: {
        readonly id: {
            readonly type: "string";
            readonly required: true;
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
            readonly type: "number";
            readonly required: true;
        };
        readonly ttl: {
            readonly type: "number";
            readonly default: () => number;
        };
    };
};
export declare const ZOAuthMock: z.ZodObject<{
    id: z.ZodString;
    pk: z.ZodString;
    sk: z.ZodString;
    user_id: z.ZodNumber;
    ttl: z.ZodNumber;
    modified: z.ZodString;
    created: z.ZodString;
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    created: string;
    modified: string;
    entity: string;
    user_id: number;
    id: string;
    pk: string;
    sk: string;
    ttl: number;
}, {
    created: string;
    modified: string;
    entity: string;
    user_id: number;
    id: string;
    pk: string;
    sk: string;
    ttl: number;
}>;
export type OAuthMock = ReturnType<typeof ZOAuthMock.parse>;
export declare class Ddb {
    table: Table<string, "pk", "sk">;
    entities: {
        oauthStateCode: Entity<"OAuthStateCode", undefined, undefined, undefined, true, true, true, "created", "modified", "entity", false, {
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
                readonly dependsOn: readonly ["id", "redirect_uri"];
                readonly default: (data: {
                    id: string;
                    redirect_uri?: string | undefined;
                }) => string;
            };
            readonly ttl: {
                readonly type: "number";
                readonly default: () => number;
            };
        }, {
            id: {
                type: "string";
                default: () => string;
            };
            pk: {
                partitionKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            sk: {
                sortKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            redirect_uri: {
                type: "string";
            };
            code: {
                type: "string";
                dependsOn: ["id", "redirect_uri"];
                default: (data: {
                    id: string;
                    redirect_uri?: string | undefined;
                }) => string;
            };
            ttl: {
                type: "number";
                default: () => number;
            };
        }, import("dynamodb-toolbox/dist/cjs/classes/Entity/types").ParseAttributes<{
            id: {
                type: "string";
                default: () => string;
            };
            pk: {
                partitionKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            sk: {
                sortKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            redirect_uri: {
                type: "string";
            };
            code: {
                type: "string";
                dependsOn: ["id", "redirect_uri"];
                default: (data: {
                    id: string;
                    redirect_uri?: string | undefined;
                }) => string;
            };
            ttl: {
                type: "number";
                default: () => number;
            };
        }, true, "created", "modified", "entity", false>, {
            code?: string | undefined;
            id?: string | undefined;
            ttl?: number | undefined;
            redirect_uri?: string | undefined;
            created: string;
            modified: string;
            entity: string;
            pk: string;
            sk: string;
        }, {
            code?: string | undefined;
            id?: string | undefined;
            ttl?: number | undefined;
            redirect_uri?: string | undefined;
            created: string;
            modified: string;
            entity: string;
            pk: string;
            sk: string;
        }, {
            pk?: string | undefined;
            sk?: string | undefined;
        }>;
        session: Entity<"Session", undefined, undefined, undefined, true, true, true, "created", "modified", "entity", false, {
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
            readonly gsi1pk: {
                readonly type: "string";
                readonly dependsOn: "user_id";
                readonly default: (data: {
                    user_id: string;
                }) => string;
            };
            readonly gsi1sk: {
                readonly type: "string";
                readonly dependsOn: "id";
                readonly default: (data: {
                    pk: string;
                }) => string;
            };
            readonly user_id: {
                readonly type: "number";
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
            readonly ttl: {
                readonly type: "number";
                readonly required: true;
            };
        }, {
            id: {
                type: "string";
                default: () => string;
            };
            pk: {
                partitionKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            sk: {
                sortKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            gsi1pk: {
                type: "string";
                dependsOn: "user_id";
                default: (data: {
                    user_id: string;
                }) => string;
            };
            gsi1sk: {
                type: "string";
                dependsOn: "id";
                default: (data: {
                    pk: string;
                }) => string;
            };
            user_id: {
                type: "number";
                required: true;
            };
            username: {
                type: "string";
                required: true;
            };
            name: {
                type: "string";
                required: true;
            };
            avatar_url: {
                type: "string";
            };
            github_url: {
                type: "string";
                required: true;
            };
            roles: {
                type: "list";
            };
            ttl: {
                type: "number";
                required: true;
            };
        }, import("dynamodb-toolbox/dist/cjs/classes/Entity/types").ParseAttributes<{
            id: {
                type: "string";
                default: () => string;
            };
            pk: {
                partitionKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            sk: {
                sortKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            gsi1pk: {
                type: "string";
                dependsOn: "user_id";
                default: (data: {
                    user_id: string;
                }) => string;
            };
            gsi1sk: {
                type: "string";
                dependsOn: "id";
                default: (data: {
                    pk: string;
                }) => string;
            };
            user_id: {
                type: "number";
                required: true;
            };
            username: {
                type: "string";
                required: true;
            };
            name: {
                type: "string";
                required: true;
            };
            avatar_url: {
                type: "string";
            };
            github_url: {
                type: "string";
                required: true;
            };
            roles: {
                type: "list";
            };
            ttl: {
                type: "number";
                required: true;
            };
        }, true, "created", "modified", "entity", false>, {
            id?: string | undefined;
            avatar_url?: string | undefined;
            roles?: any[] | undefined;
            gsi1pk?: string | undefined;
            gsi1sk?: string | undefined;
            name: string;
            username: string;
            created: string;
            modified: string;
            entity: string;
            user_id: number;
            pk: string;
            sk: string;
            github_url: string;
            ttl: number;
        }, {
            id?: string | undefined;
            avatar_url?: string | undefined;
            roles?: any[] | undefined;
            gsi1pk?: string | undefined;
            gsi1sk?: string | undefined;
            name: string;
            username: string;
            created: string;
            modified: string;
            entity: string;
            user_id: number;
            pk: string;
            sk: string;
            github_url: string;
            ttl: number;
        }, {
            pk?: string | undefined;
            sk?: string | undefined;
        }>;
        oauthMock: Entity<"OAuthMock", undefined, undefined, undefined, true, true, true, "created", "modified", "entity", false, {
            readonly id: {
                readonly type: "string";
                readonly required: true;
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
                readonly type: "number";
                readonly required: true;
            };
            readonly ttl: {
                readonly type: "number";
                readonly default: () => number;
            };
        }, {
            id: {
                type: "string";
                required: true;
            };
            pk: {
                partitionKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            sk: {
                sortKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            user_id: {
                type: "number";
                required: true;
            };
            ttl: {
                type: "number";
                default: () => number;
            };
        }, import("dynamodb-toolbox/dist/cjs/classes/Entity/types").ParseAttributes<{
            id: {
                type: "string";
                required: true;
            };
            pk: {
                partitionKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            sk: {
                sortKey: true;
                type: "string";
                default: (data: {
                    id: string;
                }) => string;
            };
            user_id: {
                type: "number";
                required: true;
            };
            ttl: {
                type: "number";
                default: () => number;
            };
        }, true, "created", "modified", "entity", false>, {
            ttl?: number | undefined;
            created: string;
            modified: string;
            entity: string;
            user_id: number;
            id: string;
            pk: string;
            sk: string;
        }, {
            ttl?: number | undefined;
            created: string;
            modified: string;
            entity: string;
            user_id: number;
            id: string;
            pk: string;
            sk: string;
        }, {
            pk?: string | undefined;
            sk?: string | undefined;
        }>;
    };
    constructor(props: {
        tableName: string;
        client: DynamoDBClient;
    });
}
