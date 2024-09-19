import { useRouteLoaderData } from "@remix-run/react";
import React from "react";
import { Toaster as _Toaster, toast } from "~/components/ui/sonner";
import { type loader } from "~/root";

export function Toaster() {
  useGlobalFlash();

  return <_Toaster />;
}

function useGlobalFlash() {
  const flash = useRouteLoaderData<typeof loader>("root")?.flash;

  React.useEffect(() => {
    if (flash) {
      const { id, title, type, message } = flash;
      if (type === "success") toast.success(title, { id, description: message });
      else if (type === "error") toast.error(title, { id, description: message });
      else if (type === "warning") toast.warning(title, { id, description: message });
      else if (type === "info") toast.info(title, { id, description: message });
    }
  }, [flash]);
}
