import { z } from "zod";

/**
 * The schema for the API response from the Github API for the "user" scope.
 */
export const ZGithubUserInfo = z.object({
  /**
   * The Github username.
   */
  login: z.string(),
  /**
   * The Github user ID.
   */
  id: z.number(),
  /**
   * The Github user name.
   */
  name: z.string(),
  /**
   * The Github user avatar url.
   */
  avatar_url: z.string(),
  /**
   * The Github user profile URL.
   */
  html_url: z.string(),
});
