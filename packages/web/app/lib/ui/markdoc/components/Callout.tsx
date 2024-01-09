import type { Schema } from "@markdoc/markdoc";
import { RiInformationFill, RiAlertFill, RiErrorWarningFill } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451

export const callout: Schema = {
  render: "Callout",
  children: ["paragraph", "tag", "list"],
  attributes: {
    type: {
      type: String,
      default: "info",
      matches: ["info", "warning", "error"],
    },
    title: {
      type: String,
    },
  },
};

export interface CalloutProps {
  title: string;
  type: string;
  children: React.ReactNode;
}

export function Callout({ title, type, children }: CalloutProps) {
  if (type === "info") {
    return (
      <div className="mt-4 grid grid-flow-col grid-cols-[max-content_1fr] gap-2 rounded-lg border border-blue-4 bg-blue-3 px-4 py-3">
        <RiInformationFill className="text-lg text-blue-12" />
        <div className="grid">
          <p className="text-sm font-semibold text-blue-12">{title.toUpperCase()}</p>
          <span className="[&>p]:mt-0">{children}</span>
        </div>
      </div>
    );
  } else if (type === "warning") {
    return (
      <div className="mt-4 grid grid-flow-col grid-cols-[max-content_1fr] gap-2 rounded-lg border border-orange-4 bg-orange-3 px-4 py-3">
        <RiAlertFill className="text-lg text-orange-12" />
        <div className="grid">
          <p className="text-sm font-semibold text-orange-12">{title.toUpperCase()}</p>
          <span className="[&>p]:mt-0">{children}</span>
        </div>
      </div>
    );
  } else if (type === "error") {
    return (
      <div className="mt-4 grid grid-flow-col grid-cols-[max-content_1fr] gap-2 rounded-lg border border-red-4 bg-red-3 px-4 py-3">
        <RiErrorWarningFill className="text-lg text-red-12" />
        <div className="grid">
          <p className="text-sm font-semibold text-red-12">{title.toUpperCase()}</p>
          <span className="[&>p]:mt-0">{children}</span>
        </div>
      </div>
    );
  }
}
