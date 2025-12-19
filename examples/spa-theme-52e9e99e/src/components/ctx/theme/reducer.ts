import { produce } from "immer";
import { z } from "zod/v4";

// -------------------------------------------------------------------------------------
// create schema
// -------------------------------------------------------------------------------------

export const ZTheme = z.object({
  actual: z.enum(["dark", "light", "system"]),
  resolved: z.enum(["dark", "light"]),
});
export type ITheme = z.infer<typeof ZTheme>;

// -------------------------------------------------------------------------------------
// create action map
// -------------------------------------------------------------------------------------

/**
 * Creates an action map from a passed object.
 *
 * Takes in a map of actions + their payloads and creates a new map with the action
 * represented as a type object. This is necessary when producing type unions where the
 * action string can be used as the discriminator in a discriminated union.
 */
type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? { type: Key }
    : undefined extends M[Key]
      ? { type: Key; payload?: M[Key] }
      : { type: Key; payload: M[Key] };
};

/**
 * Creates a discriminated union from a passed map.
 */
type ActionUnion<M extends { [index: string]: any }> = ActionMap<M>[keyof ActionMap<M>];

export type Actions = ActionUnion<{ toggle: undefined; set: Partial<ITheme> }>;

// -------------------------------------------------------------------------------------
// create reducer
// -------------------------------------------------------------------------------------

export const reducer = produce<ITheme, Actions[]>((draft, action) => {
  switch (action.type) {
    case "toggle": {
      if (draft.actual === "light") {
        draft.actual = "dark";
        draft.resolved = "dark";
      } else if (draft.actual === "dark") {
        draft.actual = "system";
        draft.resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        draft.actual = "light";
        draft.resolved = "light";
      }
      break;
    }
    case "set": {
      draft = { ...draft, ...action.payload };
      break;
    }
  }
});
