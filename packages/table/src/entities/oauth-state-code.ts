import { Entity, EntityItem } from "dynamodb-toolbox";
import { z } from "zod";
import ms from "ms";
import { randomBytes } from "crypto";

const ZCode = z.object({ id: z.string(), redirect_uri: z.string().optional() });

export const OAuthStateCodeSchema = {
  name: "OAuthStateCode",
  attributes: {
    id: { type: "string", default: () => randomBytes(16).toString("hex") },
    pk: { partitionKey: true, type: "string", default: (data: { id: string }) => `oauth_state_code#${data.id}` },
    sk: { sortKey: true, type: "string", default: (data: { id: string }) => `oauth_state_code#${data.id}` },
    redirect_uri: { type: "string" },
    code: { type: "string", default: (data: any) => JSON.stringify(ZCode.parse(data)) },
    ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
  },
} as const;

export const OAuthStateCodeEntity = new Entity(OAuthStateCodeSchema);

export type OAuthStateCodeType = EntityItem<typeof OAuthStateCodeEntity>;

export const ZOAuthStateCode = z.object({
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  redirect_uri: z.string().optional(),
  code: z.string(),
  ttl: z.number(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
});
