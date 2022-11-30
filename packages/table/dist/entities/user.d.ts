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
export declare const ZUser: z.ZodObject<{
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
    roles?: string[] | undefined;
    permissions?: string[] | undefined;
    id: string;
    pk: string;
    sk: string;
    modified: string;
    created: string;
    entity: string;
    username: string;
    name: string;
    github_url: string;
}>;
export type UserType = ReturnType<typeof ZUser.parse>;
//# sourceMappingURL=user.d.ts.map