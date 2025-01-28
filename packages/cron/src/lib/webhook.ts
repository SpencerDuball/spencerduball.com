export interface WebhookRequiredHeaders {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
}

export interface WebhookOptions {
  format?: "raw";
}

export class Webhook {
  private static readonly prefix = "whsec_";

  constructor(secret: string | Uint8Array, options?: WebhookOptions) {
    if (!secret) throw new Error();
  }
}
