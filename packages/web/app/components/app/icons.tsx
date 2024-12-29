import * as React from "react";

export function PrintablesIcon(props: React.ComponentPropsWithRef<"svg">) {
  return (
    <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M20 128L64.3815 102.4L20 76.8V128Z" fill="currentColor" />
      <path d="M64.3815 0L20 25.6L64.3815 51.2V102.4L108.763 76.8V25.6L64.3815 0Z" fill="currentColor" />
    </svg>
  );
}
