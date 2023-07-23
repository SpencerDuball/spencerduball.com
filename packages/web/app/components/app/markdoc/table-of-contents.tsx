import * as React from "react";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { Button } from "~/components/ui/button";
import { IHeadingInfo, cn } from "~/lib/util";

export interface TableOfContentsProps extends React.ComponentProps<"nav"> {
  headings: IHeadingInfo[];
}
export function TableOfContents({ headings, className, ...props }: TableOfContentsProps) {
  const ulRef = React.useRef<HTMLUListElement>(null!);
  const [expand, setExpand] = React.useState(false);
  const [overflows, setOverflows] = React.useState(false);
  React.useEffect(() => {
    if (ulRef.current && ulRef.current.scrollHeight > ulRef.current.clientHeight) setOverflows(true);
  }, []);

  return (
    <nav
      className={cn("grid relative gap-1 w-full max-w-3xl bg-slate-2 rounded-md border border-slate-6 p-3", {
        className,
      })}
      {...props}
    >
      <p className="pt-1.5 text-md text-slate-11 font-bold uppercase">Contents</p>
      <ul ref={ulRef} className={cn("py-1.5", !expand && "max-h-[300px] overflow-y-clip")}>
        {headings.map(({ level, label, id }) => {
          const href = `#${id}`;
          if (level === 1)
            return (
              <li key={id}>
                <a href={href} className="block text-sm focus-outline text-slate-9 hover:text-slate-12 underline">
                  {label}
                </a>
              </li>
            );
          else if (level === 2)
            return (
              <li key={id}>
                <a href={href} className="block pl-3 text-sm focus-outline text-slate-9 hover:text-slate-12 underline">
                  {label}
                </a>
              </li>
            );
          else if (level === 3)
            return (
              <li key={id}>
                <a href={href} className="block pl-6 text-sm focus-outline text-slate-9 hover:text-slate-12 underline">
                  {label}
                </a>
              </li>
            );
          else if (level === 4)
            return (
              <li key={id}>
                <a href={href} className="block pl-9 text-sm focus-outline text-slate-9 hover:text-slate-12 underline">
                  {label}
                </a>
              </li>
            );
          else
            return (
              <li key={id}>
                <a href={href} className="block pl-12 text-sm focus-outline text-slate-9 hover:text-slate-12 underline">
                  {label}
                </a>
              </li>
            );
        })}
      </ul>
      {overflows && (
        <Button
          variant="subtle"
          className={cn("w-full border border-slate-5", !expand && "absolute bottom-3 left-3 w-[calc(100%-1.5rem)]")}
          onClick={() => setExpand(!expand)}
        >
          <span className="grid grid-flow-col items-center gap-1">
            {expand ? "Less" : "More"} {expand ? <RiArrowUpSFill /> : <RiArrowDownSFill />}
          </span>
        </Button>
      )}
    </nav>
  );
}
