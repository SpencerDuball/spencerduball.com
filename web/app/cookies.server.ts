import { createCookie } from "@remix-run/node";
import ms from "ms";

export const generateExpiry = () => new Date(Date.now() + ms("90d"));

export const sessionCookie = createCookie("session_cookie", {
  // domain: "remix.run", - set this when serializing session
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: true,
  maxAge: Math.round(ms("7d") / 1000),
  // expires: generateExpires(), - set this when serializing session
});
