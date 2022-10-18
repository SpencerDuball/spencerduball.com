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
    pk: string;
    sk: string;
    ttl: number;
    modified: string;
    created: string;
    entity: string;
    user_id: string;
}, {
    id: string;
    pk: string;
    sk: string;
    ttl: number;
    modified: string;
    created: string;
    entity: string;
    user_id: string;
}>;
export declare type SessionType = ReturnType<typeof ZSession.parse>;
//# sourceMappingURL=session.d.ts.map