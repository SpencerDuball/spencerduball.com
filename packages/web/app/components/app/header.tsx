import * as React from "react";
import { cx, css } from "styled-system/css";

export function Header({ className, ...props }: React.ComponentProps<"div">) {
  return <header className={cx(css({ display: "grid", width: "full", height: 20 }), className)} {...props}></header>;
}
