import * as React from "react";
import { cx, css } from "styled-system/css";
import { RiTwitterXFill, RiGithubFill } from "react-icons/ri";
import { PrintablesIcon } from "~/components/app/icons";

export function Footer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <footer
      className={cx(css({ display: "grid", height: 20, width: "full", justifyItems: "center" }), className)}
      {...props}
    >
      {/* Left Side Footer */}
      <div
        className={css({
          display: "grid",
          height: "full",
          width: "full",
          maxW: "5xl",
          gridAutoFlow: "column",
          alignItems: "center",
          justifyContent: "space-between",
          px: 4,
        })}
      >
        <div className={css({ display: "grid", gridAutoColumns: "min", gridAutoFlow: "column", gap: 2 })}>
          <a
            className={css({ height: "min", width: "min", p: 2 })}
            href="https://x.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiTwitterXFill className={css({ height: 4, width: 4 })} />
          </a>
          <a
            className={css({ height: "min", width: "min", p: 2 })}
            href="https://github.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiGithubFill className={css({ height: 4, width: 4 })} />
          </a>
          <a
            className={css({ height: "min", width: "min", p: 2 })}
            href="https://www.printables.com/@spencer_dubal_212303"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PrintablesIcon className={css({ height: 4, width: 4 })} />
          </a>
        </div>

        {/* Right Side Footer */}
        <div></div>
      </div>
    </footer>
  );
}
