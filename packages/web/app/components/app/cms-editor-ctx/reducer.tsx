import Markdoc from "@markdoc/markdoc";
import type { ICmsEditorState } from "./context";
import { IAttachment } from "~/model/attachment";
import type { FetcherWithComponents } from "@remix-run/react";

export const CmsEditorSettingsKey = "cms-editor-settings";

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

export enum Types {
  // state.settings
  ToggleTheme = "TOGGLE_THEME",
  ToggleMode = "TOGGLE_MODE",
  ToggleLineWrap = "TOGGLE_LINE_WRAP",
  // state.editor
  SetScroll = "SET_SCROLL",
  // state.data
  SetValue = "SET_VALUE",
  UpsertAttachment = "UPSERT_ATTACHMENT",
  RemoveAttachment = "REMOVE_ATTACHMENT",
  // state.server
  SetFetcher = "SET_FETCHER",
  // escapes for raw set values
  SetState = "SET_STATE",
}

type Payload = {
  // state.settings
  [Types.ToggleTheme]: undefined;
  [Types.ToggleMode]: undefined;
  [Types.ToggleLineWrap]: undefined;
  // state.editor
  [Types.SetScroll]: { x: number; y: number };
  // state.data
  [Types.SetValue]: { value: string; prettify?: boolean; save?: boolean };
  [Types.UpsertAttachment]: IAttachment;
  [Types.RemoveAttachment]: string;
  // state.server
  [Types.SetFetcher]: FetcherWithComponents<any>;
  // escapes for raw set values
  [Types.SetState]: ICmsEditorState;
};

export type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

export const reducer = (state: ICmsEditorState, action: Actions) => {
  switch (action.type) {
    case Types.ToggleTheme: {
      // determine next state
      let theme: typeof state.settings.theme = "light";
      if (state.settings.theme === "light") theme = "dark";
      else if (state.settings.theme === "dark") theme = "system";
      const next = { ...state, settings: { ...state.settings, theme } };

      // update settings localstorage
      localStorage.setItem(CmsEditorSettingsKey, JSON.stringify(next.settings));

      return next;
    }
    case Types.ToggleMode: {
      // determine next state
      let mode: typeof state.settings.mode;
      if (state.settings.mode === "vim") mode = "normal";
      else mode = "vim";
      const next = { ...state, settings: { ...state.settings, mode } };

      // update settings localstorage
      localStorage.setItem(CmsEditorSettingsKey, JSON.stringify(next.settings));

      return next;
    }
    case Types.ToggleLineWrap: {
      // determine next state
      const next = { ...state, settings: { ...state.settings, lineWrap: !state.settings.lineWrap } };

      // update settings localstorage
      localStorage.setItem(CmsEditorSettingsKey, JSON.stringify(next.settings));

      return next;
    }
    case Types.SetScroll: {
      return { ...state, editor: { ...state.editor, pos: { ...action.payload } } };
    }
    case Types.SetValue: {
      let value = action.payload.value;
      if (action.payload.prettify) value = Markdoc.format(Markdoc.parse(value));
      if (action.payload.save) {
        // Note: We need to have a `setTimeout` so that this will run after the reducer returns. If we don't we will get a
        // react error of "Cannot update a component while rendering a different component".
        if (state.server)
          setTimeout(() => state.server!.save.fetcher.submit({ body: value }, state.server!.save.submitOptions), 0);
      }
      return { ...state, data: { ...state.data, value } };
    }
    case Types.UpsertAttachment: {
      const attachments: IAttachment[] = [
        ...state.data.attachments.filter(({ id }) => id !== action.payload.id),
        action.payload,
      ];

      return { ...state, data: { ...state.data, attachments } };
    }
    case Types.RemoveAttachment: {
      const attachments: IAttachment[] = state.data.attachments.filter(({ id }) => id !== action.payload);
      return { ...state, data: { ...state.data, attachments } };
    }
    case Types.SetFetcher: {
      if (!state.server) return state;
      else return { ...state, server: { ...state.server, save: { ...state.server.save, fetcher: action.payload } } };
    }
    case Types.SetState: {
      // update settings localstorage
      localStorage.setItem(CmsEditorSettingsKey, JSON.stringify(action.payload.settings));

      return { ...action.payload };
    }
    default:
      return state;
  }
};
