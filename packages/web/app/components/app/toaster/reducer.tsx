import React from "react";
import type { AutoCompleteString } from "~/lib/util";
import type { IToasterState } from "./context";

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

/* ------------------------------------------------------------------------------------------------------------
 * Define Context Types
 * ------------------------------------------------------------------------------------------------------------ */
export const ToastTypes = ["success", "warning", "error", "info"] as const;
export type ToastType = AutoCompleteString<(typeof ToastTypes)[number]>;

export const ToastPlacements = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"] as const;
export type ToastPlacementType = AutoCompleteString<(typeof ToastPlacements)[number]>;

export interface IToast {
  id: string;
  type: ToastType;
  placement: ToastPlacementType;
  title?: string;
  description?: string;
  duration: number;
  timeoutId: number[];
  element?: React.ReactNode;
  createdAt: Date;
}

/* ------------------------------------------------------------------------------------------------------------
 * Create Reducer
 * ------------------------------------------------------------------------------------------------------------ */
export enum Types {
  AddToast = "ADD_TOAST",
  UpsertToast = "UPSERT_TOAST",
  UpdateToast = "UPDATE_TOAST",
  RemoveToast = "REMOVE_TOAST",
  RemoveTimer = "REMOVE_TIMER",
  RestartTimer = "RESTART_TIMER",
  SetState = "SET_STATE",
}

export type Payload = {
  [Types.AddToast]: Partial<IToast>;
  [Types.UpsertToast]: Partial<IToast> & Pick<IToast, "id">;
  [Types.UpdateToast]: Partial<IToast> & Pick<IToast, "id">;
  [Types.RemoveToast]: Pick<IToast, "id">;
  [Types.RemoveTimer]: Pick<IToast, "id">;
  [Types.RestartTimer]: Pick<IToast, "id">;
  [Types.SetState]: IToasterState;
};

export type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

function sortToasts(prev: IToast, next: IToast) {
  return prev.createdAt.getTime() - next.createdAt.getTime();
}

export const reducer = (state: IToasterState, action: Actions) => {
  switch (action.type) {
    case Types.AddToast: {
      const [id, type, placement, duration] = [
        window.crypto.randomUUID(),
        "info",
        "bottom-end",
        action.payload.duration || 3000,
      ];
      const toast: IToast = {
        id,
        type,
        placement,
        duration,
        timeoutId: [],
        createdAt: new Date(),
        ...action.payload,
      };
      setTimeout(() => state.dispatch?.({ type: Types.RestartTimer, payload: { id } }), 0);
      return { ...state, toasts: [...state.toasts, toast].sort(sortToasts) };
    }
    case Types.UpsertToast: {
      const toast = state.toasts.find(({ id }) => id === action.payload.id);
      let newToast: IToast;

      if (toast) {
        newToast = { ...toast, ...action.payload };
        if (action.payload.duration)
          setTimeout(() => state.dispatch?.({ type: Types.RestartTimer, payload: { id: toast.id } }), 0);
      } else {
        const [type, placement, duration] = ["info", "bottom-end", 3000];
        newToast = {
          type,
          placement,
          duration,
          timeoutId: [],
          createdAt: new Date(),
          ...action.payload,
        };
        setTimeout(() => state.dispatch?.({ type: Types.RestartTimer, payload: { id: action.payload.id } }), 0);
      }

      const toasts = [...state.toasts.filter(({ id }) => id !== newToast.id), newToast].sort(sortToasts);
      return { ...state, toasts };
    }
    case Types.UpdateToast: {
      const toast = state.toasts.find(({ id }) => id === action.payload.id);
      if (!toast) return state;

      const newToast = { ...toast, ...action.payload };
      if (action.payload.duration)
        setTimeout(() => state.dispatch?.({ type: Types.RestartTimer, payload: { id: toast.id } }), 0);

      const toasts = [...state.toasts.filter(({ id }) => id !== newToast.id), newToast].sort(sortToasts);
      return { ...state, toasts };
    }
    case Types.RemoveToast: {
      const toast = state.toasts.find(({ id }) => id === action.payload.id);
      while (toast && toast.timeoutId.length > 0) clearTimeout(toast.timeoutId.pop());
      return { ...state, toasts: state.toasts.filter(({ id }) => id !== action.payload.id) };
    }
    case Types.RemoveTimer: {
      const toast = state.toasts.find(({ id }) => id === action.payload.id);
      if (!toast) return state;

      let newToast: IToast = { ...toast };
      while (newToast.timeoutId.length > 0) clearTimeout(newToast.timeoutId.pop());

      const toasts = [...state.toasts.filter(({ id }) => id !== newToast.id), newToast].sort(sortToasts);
      return { ...state, toasts };
    }
    case Types.RestartTimer: {
      const toast = state.toasts.find(({ id }) => id === action.payload.id);
      if (!toast) return state;

      let newToast: IToast = { ...toast };
      while (newToast.timeoutId.length > 0) clearTimeout(newToast.timeoutId.pop());
      if (toast.duration !== Infinity)
        newToast.timeoutId.push(
          window.setTimeout(
            () => state.dispatch?.({ type: Types.RemoveToast, payload: { id: toast.id } }),
            newToast.duration
          )
        );

      const toasts = [...state.toasts.filter(({ id }) => id !== newToast.id), newToast].sort(sortToasts);
      return { ...state, toasts };
    }
    case Types.SetState: {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};
