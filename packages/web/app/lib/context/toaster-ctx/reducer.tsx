import type { AutoCompleteString } from "~/lib/util/utils";

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
  timeoutIds: number[];
  createdAt: Date;
}

// define the full context state
export interface IToasterState {
  toasts: IToast[];
  addToQueue: (action: Actions) => void;
}

/* ------------------------------------------------------------------------------------------------------------
 * Create ActionMap
 * ------------------------------------------------------------------------------------------------------------ */
type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

export enum Types {
  AddToast = "ADD_TOAST",
  UpsertToast = "UPSERT_TOAST",
  UpdateToast = "UPDATE_TOAST",
  RemoveToast = "REMOVE_TOAST",
  RemoveTimer = "REMOVE_TIMER",
  RestartTimer = "RESTART_TIMER",
}

export type Payload = {
  [Types.AddToast]: Partial<IToast>;
  [Types.UpsertToast]: Partial<IToast> & Pick<IToast, "id">;
  [Types.UpdateToast]: Partial<IToast> & Pick<IToast, "id">;
  [Types.RemoveToast]: IToast["id"];
  [Types.RemoveTimer]: IToast["id"];
  [Types.RestartTimer]: IToast["id"];
};

export type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

/* ------------------------------------------------------------------------------------------------------------
 * Create Reducer
 * ------------------------------------------------------------------------------------------------------------ */
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
        timeoutIds: [],
        createdAt: new Date(),
        ...action.payload,
      };
      state.addToQueue({ type: Types.RestartTimer, payload: id });
      const newToasts = [...state.toasts, toast].sort(sortToasts);
      return { ...state, toasts: newToasts };
    }
    case Types.UpsertToast: {
      const toast = state.toasts.find(({ id }) => id === action.payload.id);
      let newToast: IToast;

      if (toast) {
        newToast = { ...toast, ...action.payload };
        if (action.payload.duration) state.addToQueue({ type: Types.RestartTimer, payload: newToast.id });
      } else {
        const [type, placement, duration] = ["info", "bottom-end", 3000];
        newToast = {
          type,
          placement,
          duration,
          timeoutIds: [],
          createdAt: new Date(),
          ...action.payload,
        };
        state.addToQueue({ type: Types.RestartTimer, payload: newToast.id });
      }

      const toasts = [...state.toasts.filter(({ id }) => id !== newToast.id), newToast].sort(sortToasts);
      return { ...state, toasts };
    }
    case Types.UpdateToast: {
      const toast = state.toasts.find(({ id }) => id === action.payload.id);
      if (!toast) return state;

      const newToast = { ...toast, ...action.payload };
      if (action.payload.duration) state.addToQueue({ type: Types.RestartTimer, payload: newToast.id });

      const toasts = [...state.toasts.filter(({ id }) => id !== newToast.id), newToast].sort(sortToasts);
      return { ...state, toasts };
    }
    case Types.RemoveToast: {
      const toast = state.toasts.find(({ id }) => id === action.payload);
      while (toast && toast.timeoutIds.length > 0) clearTimeout(toast.timeoutIds.pop());
      const filteredToasts = state.toasts.filter(({ id }) => id !== action.payload);
      return { ...state, toasts: filteredToasts };
    }
    case Types.RemoveTimer: {
      const toast = state.toasts.find(({ id }) => id === action.payload);
      if (!toast) return state;

      let newToast: IToast = { ...toast };
      while (newToast.timeoutIds.length > 0) clearTimeout(newToast.timeoutIds.pop());

      const toasts = [...state.toasts.filter(({ id }) => id !== newToast.id), newToast].sort(sortToasts);
      return { ...state, toasts };
    }
    case Types.RestartTimer: {
      const toast = state.toasts.find(({ id }) => id === action.payload);
      if (!toast) return state;

      let newToast: IToast = { ...toast };
      while (newToast.timeoutIds.length > 0) clearTimeout(newToast.timeoutIds.pop());
      if (toast.duration !== Infinity) {
        const timeoutId = window.setTimeout(
          () => state.addToQueue({ type: Types.RemoveToast, payload: newToast.id }),
          newToast.duration,
        );
        newToast.timeoutIds.push(timeoutId);
      }

      const toasts = [...state.toasts.filter(({ id }) => id !== newToast.id), newToast].sort(sortToasts);
      return { ...state, toasts };
    }
    default: {
      return state;
    }
  }
};

function sortToasts(prev: IToast, next: IToast) {
  return prev.createdAt.getTime() - next.createdAt.getTime();
}
