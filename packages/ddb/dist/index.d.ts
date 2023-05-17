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
            readonly dependsOn: "userId";
            readonly default: (data: {
                userId: string;
            }) => string;
        };
        readonly gsi1sk: {
            readonly type: "string";
            readonly dependsOn: "id";
            readonly default: (data: {
                pk: string;
            }) => string;
        };
        readonly userId: {
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
        readonly avatarUrl: {
            readonly type: "string";
        };
        readonly githubUrl: {
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
    userId: z.ZodNumber;
    username: z.ZodString;
    name: z.ZodString;
    avatarUrl: z.ZodOptional<z.ZodString>;
    githubUrl: z.ZodString;
    roles: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], unknown>;
    ttl: z.ZodNumber;
    modified: z.ZodString;
    created: z.ZodString;
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: number;
    id: string;
    pk: string;
    sk: string;
    username: string;
    name: string;
    githubUrl: string;
    roles: string[];
    ttl: number;
    modified: string;
    created: string;
    entity: string;
    avatarUrl?: string | undefined;
}, {
    userId: number;
    id: string;
    pk: string;
    sk: string;
    username: string;
    name: string;
    githubUrl: string;
    ttl: number;
    modified: string;
    created: string;
    entity: string;
    avatarUrl?: string | undefined;
    roles?: unknown;
}>;
export type SessionType = ReturnType<typeof ZSession.parse>;
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
        readonly redirectUri: {
            readonly type: "string";
        };
        readonly code: {
            readonly type: "string";
            readonly dependsOn: readonly ["id", "redirectUri"];
            readonly default: (data: {
                id: string;
                redirectUri?: string;
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
    redirectUri: z.ZodOptional<z.ZodString>;
    code: z.ZodString;
    ttl: z.ZodNumber;
    modified: z.ZodString;
    created: z.ZodString;
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    pk: string;
    sk: string;
    code: string;
    ttl: number;
    modified: string;
    created: string;
    entity: string;
    redirectUri?: string | undefined;
}, {
    id: string;
    pk: string;
    sk: string;
    code: string;
    ttl: number;
    modified: string;
    created: string;
    entity: string;
    redirectUri?: string | undefined;
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
        readonly userId: {
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
    userId: z.ZodNumber;
    ttl: z.ZodNumber;
    modified: z.ZodString;
    created: z.ZodString;
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: number;
    id: string;
    pk: string;
    sk: string;
    ttl: number;
    modified: string;
    created: string;
    entity: string;
}, {
    userId: number;
    id: string;
    pk: string;
    sk: string;
    ttl: number;
    modified: string;
    created: string;
    entity: string;
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
            readonly redirectUri: {
                readonly type: "string";
            };
            readonly code: {
                readonly type: "string";
                readonly dependsOn: readonly ["id", "redirectUri"];
                readonly default: (data: {
                    id: string;
                    redirectUri?: string | undefined;
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
            redirectUri: {
                type: "string";
            };
            code: {
                type: "string";
                dependsOn: ["id", "redirectUri"];
                default: (data: {
                    id: string;
                    redirectUri?: string | undefined;
                }) => string;
            };
            ttl: {
                type: "number";
                default: () => number;
            };
        }, import("dynamodb-toolbox/dist/classes/Entity").ParseAttributes<{
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
            redirectUri: {
                type: "string";
            };
            code: {
                type: "string";
                dependsOn: ["id", "redirectUri"];
                default: (data: {
                    id: string;
                    redirectUri?: string | undefined;
                }) => string;
            };
            ttl: {
                type: "number";
                default: () => number;
            };
        }, true, "created", "modified", "entity", false>, {
            id?: string | undefined;
            code?: string | undefined;
            ttl?: number | undefined;
            redirectUri?: string | undefined;
            pk: string;
            sk: string;
            modified: string;
            created: string;
            entity: string;
        }, {
            id?: string | undefined;
            code?: string | undefined;
            ttl?: number | undefined;
            redirectUri?: string | undefined;
            pk: string;
            sk: string;
            modified: string;
            created: string;
            entity: string;
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
                readonly dependsOn: "userId";
                readonly default: (data: {
                    userId: string;
                }) => string;
            };
            readonly gsi1sk: {
                readonly type: "string";
                readonly dependsOn: "id";
                readonly default: (data: {
                    pk: string;
                }) => string;
            };
            readonly userId: {
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
            readonly avatarUrl: {
                readonly type: "string";
            };
            readonly githubUrl: {
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
                dependsOn: "userId";
                default: (data: {
                    userId: string;
                }) => string;
            };
            gsi1sk: {
                type: "string";
                dependsOn: "id";
                default: (data: {
                    pk: string;
                }) => string;
            };
            userId: {
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
            avatarUrl: {
                type: "string";
            };
            githubUrl: {
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
        }, import("dynamodb-toolbox/dist/classes/Entity").ParseAttributes<{
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
                dependsOn: "userId";
                default: (data: {
                    userId: string;
                }) => string;
            };
            gsi1sk: {
                type: "string";
                dependsOn: "id";
                default: (data: {
                    pk: string;
                }) => string;
            };
            userId: {
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
            avatarUrl: {
                type: "string";
            };
            githubUrl: {
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
            avatarUrl?: string | undefined;
            roles?: any[] | undefined;
            gsi1pk?: string | undefined;
            gsi1sk?: string | undefined;
            userId: number;
            pk: string;
            sk: string;
            username: string;
            name: string;
            githubUrl: string;
            ttl: number;
            modified: string;
            created: string;
            entity: string;
        }, {
            id?: string | undefined;
            avatarUrl?: string | undefined;
            roles?: any[] | undefined;
            gsi1pk?: string | undefined;
            gsi1sk?: string | undefined;
            userId: number;
            pk: string;
            sk: string;
            username: string;
            name: string;
            githubUrl: string;
            ttl: number;
            modified: string;
            created: string;
            entity: string;
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
            readonly userId: {
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
            userId: {
                type: "number";
                required: true;
            };
            ttl: {
                type: "number";
                default: () => number;
            };
        }, import("dynamodb-toolbox/dist/classes/Entity").ParseAttributes<{
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
            userId: {
                type: "number";
                required: true;
            };
            ttl: {
                type: "number";
                default: () => number;
            };
        }, true, "created", "modified", "entity", false>, {
            ttl?: number | undefined;
            userId: number;
            id: string;
            pk: string;
            sk: string;
            modified: string;
            created: string;
            entity: string;
        }, {
            ttl?: number | undefined;
            userId: number;
            id: string;
            pk: string;
            sk: string;
            modified: string;
            created: string;
            entity: string;
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
