import React from "react";
import { reducer, Actions, IToast, IToasterState } from "./reducer";
import { Toast } from "./toast";

/* ------------------------------------------------------------------------------------------------------------
 * Define ToasterCtx, ToasterProvider
 * ------------------------------------------------------------------------------------------------------------ */
// define initial ToasterState
export const InitialToasterState: IToasterState = { toasts: [], addToQueue: () => null };

// create ToasterCtx
export const ToasterCtx = React.createContext<[IToasterState, React.Dispatch<Actions>]>([
  InitialToasterState,
  () => null,
]);

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  // define the queue state
  const [queue, setQueue] = React.useState<Actions[]>([]);
  const addToQueue = (action: Actions) => setQueue([...queue, action]);

  // define the toaster state
  const [state, dispatch] = React.useReducer(reducer, { ...InitialToasterState, addToQueue });

  // process the queue
  React.useEffect(() => {
    if (queue.length > 0) {
      const [action, ...rest] = queue;
      dispatch(action);
      setQueue(rest);
    }
  }, [queue]);

  return (
    <ToasterCtx.Provider value={[state, dispatch]}>
      <>
        <div className="absolute top-2 left-2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
          {state.toasts
            .filter(({ placement }) => placement === "top-start")
            .map(({ id, type, title, description }) => (
              <Toast key={id} toastId={id} type={type} title={title} description={description} />
            ))}
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
          {state.toasts
            .filter(({ placement }) => placement === "top")
            .map(({ id, type, title, description }) => (
              <Toast key={id} toastId={id} type={type} title={title} description={description} />
            ))}
        </div>
        <div className="absolute top-2 right-2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
          {state.toasts
            .filter(({ placement }) => placement === "top-end")
            .map(({ id, type, title, description }) => (
              <Toast key={id} toastId={id} type={type} title={title} description={description} />
            ))}
        </div>
        <div className="absolute bottom-2 left-2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
          {state.toasts
            .filter(({ placement }) => placement === "bottom-start")
            .map(({ id, type, title, description }) => (
              <Toast key={id} toastId={id} type={type} title={title} description={description} />
            ))}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
          {state.toasts
            .filter(({ placement }) => placement === "bottom")
            .map(({ id, type, title, description }) => (
              <Toast key={id} toastId={id} type={type} title={title} description={description} />
            ))}
        </div>
        <div className="absolute bottom-2 right-2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
          {state.toasts
            .filter(({ placement }) => placement === "bottom-end")
            .map(({ id, type, title, description }) => (
              <Toast key={id} toastId={id} type={type} title={title} description={description} />
            ))}
        </div>
        {children}
      </>
    </ToasterCtx.Provider>
  );
}

// /* ------------------------------------------------------------------------------------------------------------
//  * Define Toaster Types
//  * ------------------------------------------------------------------------------------------------------------ */
// // define editor state
// export interface IToasterState {
//   toasts: IToast[];
//   dispatch: React.Dispatch<Actions> | null;
// }

// /* ------------------------------------------------------------------------------------------------------------
//  * Define Initial ToasterState
//  * ------------------------------------------------------------------------------------------------------------ */
// export const InitialToasterState: IToasterState = {
//   toasts: [],
//   dispatch: null,
// };

// /* ------------------------------------------------------------------------------------------------------------
//  * Create ToasterCtx
//  * ------------------------------------------------------------------------------------------------------------ */
// export const ToasterCtx = React.createContext<[IToasterState, React.Dispatch<Actions>]>([
//   InitialToasterState,
//   () => null,
// ]);

// export function ToasterProvider({ children }: { children: React.ReactNode }) {
//   const [state, dispatch] = React.useReducer(reducer, { ...InitialToasterState });

//   React.useEffect(() => dispatch({ type: Types.SetState, payload: { ...state, dispatch } }), []);

//   return (
//     <ToasterCtx.Provider value={[state, dispatch]}>
//       <>
// <div className="absolute top-2 left-2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
//   {state.toasts
//     .filter(({ placement }) => placement === "top-start")
//     .map(({ id, type, title, description, }) => (
//       <Toast key={id} toastId={id} type={type} title={title} description={description} { />
//     ))}
// </div>
// <div className="absolute top-2 left-1/2 -translate-x-1/2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
//   {state.toasts
//     .filter(({ placement }) => placement === "top")
//     .map(({ id, type, title, description, }) => (
//       <Toast key={id} toastId={id} type={type} title={title} description={description} { />
//     ))}
// </div>
// <div className="absolute top-2 right-2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
//   {state.toasts
//     .filter(({ placement }) => placement === "top-end")
//     .map(({ id, type, title, description, }) => (
//       <Toast key={id} toastId={id} type={type} title={title} description={description} { />
//     ))}
// </div>
// <div className="absolute bottom-2 left-2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
//   {state.toasts
//     .filter(({ placement }) => placement === "bottom-start")
//     .map(({ id, type, title, description, }) => (
//       <Toast key={id} toastId={id} type={type} title={title} description={description} { />
//     ))}
// </div>
// <div className="absolute bottom-2 left-1/2 -translate-x-1/2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
//   {state.toasts
//     .filter(({ placement }) => placement === "bottom")
//     .map(({ id, type, title, description, }) => (
//       <Toast key={id} toastId={id} type={type} title={title} description={description} { />
//     ))}
// </div>
// <div className="absolute bottom-2 right-2 grid gap-2 z-20 pointer-events-none [&>*]:pointer-events-auto">
//   {state.toasts
//     .filter(({ placement }) => placement === "bottom-end")
//     .map(({ id, type, title, description, }) => (
//       <Toast key={id} toastId={id} type={type} title={title} description={description} { />
//     ))}
// </div>
// {children}
//       </>
//     </ToasterCtx.Provider>
//   );
// }
