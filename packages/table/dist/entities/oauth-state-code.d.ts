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
    pk: string;
    sk: string;
    ttl: number;
    modified: string;
    created: string;
    entity: string;
}, {
    redirect_uri?: string | undefined;
    id: string;
    code: string;
    pk: string;
    sk: string;
    ttl: number;
    modified: string;
    created: string;
    entity: string;
}>;
export type OAuthStateCode = ReturnType<typeof ZOAuthStateCode.parse>;
//# sourceMappingURL=oauth-state-code.d.ts.map