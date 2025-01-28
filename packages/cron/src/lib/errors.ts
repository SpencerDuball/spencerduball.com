export class BaseError extends Error {
  public readonly traceId: string;

  constructor(traceId: string, message?: string, options?: ErrorOptions) {
    if (message) super(`(${traceId}) ${message}`, { cause: options?.cause });
    else super(`(${traceId})`, { cause: options?.cause });
    this.name = this.constructor.name;
    this.traceId = traceId;
  }

  /**
   * Creates an error from a thrown item.
   *
   * @param traceId The unique identifier for the error. Typically a 6 character hex string.
   * @param message An optional default message when the thrown item is not an error.
   */
  static fromThrown<T extends typeof BaseError>(this: T, traceId: string, message?: string) {
    return (e: any) => {
      if (e instanceof Error) return new this(traceId, e.message, { cause: e }) as InstanceType<T>;
      else return new this(traceId, message || `Un unexpected item was thrown: ${e}`) as InstanceType<T>;
    };
  }
}

export class WebhookVerificationError extends BaseError {}
