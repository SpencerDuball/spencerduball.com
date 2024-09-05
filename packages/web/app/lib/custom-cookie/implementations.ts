import { createCookieFactory } from "./cookie";
import {
  createCookieSessionStorageFactory,
  createMemorySessionStorageFactory,
  createSessionStorageFactory,
} from "@remix-run/server-runtime";

import { type SignFunction, type UnsignFunction } from "@remix-run/node";
import cookieSignature from "cookie-signature";

const sign: SignFunction = async (value, secret) => {
  return cookieSignature.sign(value, secret);
};

const unsign: UnsignFunction = async (signed: string, secret: string) => {
  return cookieSignature.unsign(signed, secret);
};

export const createCookie = createCookieFactory({ sign, unsign });
export const createCookieSessionStorage = createCookieSessionStorageFactory(createCookie);
export const createSessionStorage = createSessionStorageFactory(createCookie);
export const createMemorySessionStorage = createMemorySessionStorageFactory(createSessionStorage);

// TODO: Remove these dependencies when https://github.com/remix-run/remix/discussions/9933
// is merged:
// - dependencies
//  - cookie-signature
//  - @remix-run/server-runtime
// - devDependencies
//  - @types/cookie-signature
