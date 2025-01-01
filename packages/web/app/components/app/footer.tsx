import * as React from "react";
import { cx, css } from "styled-system/css";
import { RiTwitterXFill, RiGithubFill } from "react-icons/ri";
import { PrintablesIcon } from "~/components/app/icons";

export function Footer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <footer
      className={cx(css({ display: "grid", width: "full", height: 20, justifyItems: "center" }), className)}
      {...props}
    >
      {/* Left Side Footer */}
      <div
        className={css({
          display: "grid",
          justifyContent: "space-between",
          alignItems: "center",
          gridAutoFlow: "column",
          width: "full",
          maxW: "5xl",
          height: "full",
          px: 4,
        })}
      >
        <div className={css({ display: "grid", gap: 2, gridAutoFlow: "column", gridAutoColumns: "min" })}>
          <a
            className={css({ width: "min", height: "min", p: 2 })}
            href="https://x.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiTwitterXFill className={css({ width: 4, height: 4 })} />
          </a>
          <a
            className={css({ width: "min", height: "min", p: 2 })}
            href="https://github.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiGithubFill className={css({ width: 4, height: 4 })} />
          </a>
          <a
            className={css({ width: "min", height: "min", p: 2 })}
            href="https://www.printables.com/@spencer_dubal_212303"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PrintablesIcon className={css({ width: 4, height: 4 })} />
          </a>
        </div>

        {/* Right Side Footer */}
        <div></div>
      </div>
    </footer>
  );
}
