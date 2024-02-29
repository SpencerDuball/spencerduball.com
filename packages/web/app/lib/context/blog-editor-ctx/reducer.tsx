import { type IBlog, type IBlogFile } from "~/model/blogs";

/* ------------------------------------------------------------------------------------------------------------
 * Define Context Types
 * ------------------------------------------------------------------------------------------------------------ */

interface IBlogFileTracker {
  /** Tracks the state of a blog file in it's upload journy. */
  state: "uploading" | "loading";
  /** Tracks the upload percent of a file. */
  percent: number | null;
  /** The optimistic UI information of a blog file. */
  record: IBlogFile;
  /** The File object. */
  file: File;
}

// define the full context state
export interface IBlogEditorCtxState {
  /** The saved blog record. This should be in-sync with the record on the server. */
  blog: IBlog;
  /** The files that are uploading */
  files: IBlogFileTracker[];
}

/* ------------------------------------------------------------------------------------------------------------
 * Create ActionMap
 * ------------------------------------------------------------------------------------------------------------ */
type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

export enum Types {
  AddFile = "ADD_FILE",
  SetFileProgress = "UPDATE_FILE_PROGRESS",
  RemoveFile = "REMOVE_FILE",
}

export type Payload = {
  [Types.AddFile]: { record: IBlogFile; file: File };
  [Types.SetFileProgress]: { blogFileId: string; percent: number };
  [Types.RemoveFile]: { blogFileId: string };
};

export type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

/* ------------------------------------------------------------------------------------------------------------
 * Create Reducer
 * ------------------------------------------------------------------------------------------------------------ */
export const reducer = (state: IBlogEditorCtxState, action: Actions) => {
  switch (action.type) {
    case Types.AddFile: {
      let next = structuredClone(state);
      next.files.push({
        state: "uploading",
        percent: 0,
        record: action.payload.record,
        file: action.payload.file,
      });
      return next;
    }
    case Types.SetFileProgress: {
      let next = structuredClone(state);
      next.files = next.files.map((file) => {
        if (file.record.id === action.payload.blogFileId) {
          return { ...file, percent: action.payload.percent };
        }
        return file;
      });
      return next;
    }
    case Types.RemoveFile: {
      let next = structuredClone(state);
      next.files = next.files.filter((file) => file.record.id !== action.payload.blogFileId);
      return next;
    }
    default: {
      return state;
    }
  }
};
