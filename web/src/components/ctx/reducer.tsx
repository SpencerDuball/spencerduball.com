import { z } from "zod/v4";
import type { ActionUnion } from "@/lib/utils";
import { produce } from "immer";

export const ZPrefs = z.object({
  theme: z.object({
    app: z.object({
      actual: z.enum(["dark", "light", "system"]),
      resolved: z.enum(["dark", "light"]),
    }),
    code: z.object({
      actual: z.enum(["dark", "light", "system"]),
      resolved: z.enum(["dark", "light"]),
    }),
  }),
});
export type IPrefs = z.infer<typeof ZPrefs>;

export type IActualTheme = IPrefs["theme"]["app"]["actual"];
export type IResolvedTheme = IPrefs["theme"]["app"]["resolved"];

export type Actions = ActionUnion<{
  "theme.app.toggle": undefined;
  "theme.app.set": Partial<IPrefs["theme"]["app"]>;
  "theme.code.toggle": undefined;
  "theme.code.set": Partial<IPrefs["theme"]["code"]>;
}>;

export const reducer = produce<IPrefs, Actions[]>((draft, action) => {
  switch (action.type) {
    case "theme.app.toggle": {
      if (draft.theme.app.actual === "light") {
        draft.theme.app.actual = "dark";
        draft.theme.app.resolved = "dark";
      } else if (draft.theme.app.actual === "dark") {
        draft.theme.app.actual = "system";
        draft.theme.app.resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        draft.theme.app.actual = "light";
        draft.theme.app.resolved = "light";
      }
      break;
    }
    case "theme.app.set": {
      const { actual, resolved } = action.payload;
      if (actual) draft.theme.app.actual = actual;
      if (resolved) draft.theme.app.resolved = resolved;
      break;
    }
    case "theme.code.toggle": {
      if (draft.theme.code.actual === "light") {
        draft.theme.code.actual = "dark";
        draft.theme.code.resolved = "dark";
      } else if (draft.theme.code.actual === "dark") {
        draft.theme.code.actual = "system";
        draft.theme.code.resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        draft.theme.code.actual = "light";
        draft.theme.code.resolved = "light";
      }
      break;
    }
    case "theme.code.set": {
      const { actual, resolved } = action.payload;
      if (actual) draft.theme.code.actual = actual;
      if (resolved) draft.theme.code.resolved = resolved;
      break;
    }
  }
});
