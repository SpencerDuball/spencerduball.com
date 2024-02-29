import * as React from "react";
import { type IBlogEditorCtxState, type Actions, reducer, Types } from "./reducer";
import { IBlog } from "~/model/blogs";

/* ------------------------------------------------------------------------------------------------------------------
 * Define BlogEditorCtx, BlogEditorCtxProvider
 * ------------------------------------------------------------------------------------------------------------------ */
// define initial BlogEditorCtxState
export const InitialBlogEditorCtxState: IBlogEditorCtxState = {
  blog: {} as IBlog, // This will always be passed as a prop.
  files: [],
};

// create BlogEditorCtx
export const BlogEditorCtx = React.createContext<[IBlogEditorCtxState, React.Dispatch<Actions>]>([
  InitialBlogEditorCtxState,
  () => null,
]);

export interface BlogEditorCtxProviderProps {
  blog: IBlog;
  children: React.ReactNode;
}

export function BlogEditorCtxProvider({ blog, children }: BlogEditorCtxProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, InitialBlogEditorCtxState);

  return <BlogEditorCtx.Provider value={[{ ...state, blog }, dispatch]}>{children}</BlogEditorCtx.Provider>;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Define Hooks
 * ------------------------------------------------------------------------------------------------------------------ */
