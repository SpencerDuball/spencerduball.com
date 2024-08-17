import { AsyncLocalStorage } from "async_hooks";
export interface IRequestContext {
    reqId: string;
}
export declare const context: AsyncLocalStorage<IRequestContext>;
