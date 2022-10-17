import { Entity, EntityItem } from "dynamodb-toolbox";
import { z } from "zod";
import { randomBytes } from "crypto";

export const SessionSchema = {
  name: "Session",
  attributes: {
    id: { type: "string", default: () => randomBytes(16).toString("hex") },
    pk: { partitionKey: true, type: "string", default: (data: { id: string }) => `session#${data.id}` },
    sk: { sortKey: true, type: "string", default: (data: { id: string }) => `session#${data.id}` },
    user_id: { type: "string", required: true },
    ttl: { type: "number", required: true },
  },
} as const;

export const SessionEntity = new Entity(SessionSchema);

export type SessionType = EntityItem<typeof SessionEntity>;

export const ZSession = z.object({
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  user_id: z.string(),
  ttl: z.number(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
});
