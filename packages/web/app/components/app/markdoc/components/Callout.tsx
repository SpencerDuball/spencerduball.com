import type { Schema } from "@markdoc/markdoc";
import { RiInformationFill, RiAlertFill, RiErrorWarningFill } from "react-icons/ri";

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
      <div className="grid gap-2 grid-flow-col auto-cols-max rounded-lg mt-4 py-3 px-4 bg-blue-3 border border-blue-4">
        <RiInformationFill className="text-lg text-blue-12" />
        <div className="grid">
          <p className="text-blue-12 text-sm font-semibold">{title.toUpperCase()}</p>
          <span className="[&>p]:mt-0">{children}</span>
        </div>
      </div>
    );
  } else if (type === "warning") {
    return (
      <div className="grid gap-2 grid-flow-col auto-cols-max rounded-lg mt-4 py-3 px-4 bg-orange-3 border border-orange-4">
        <RiAlertFill className="text-lg text-orange-12" />
        <div className="grid">
          <p className="text-orange-12 text-sm font-semibold">{title.toUpperCase()}</p>
          <span className="[&>p]:mt-0">{children}</span>
        </div>
      </div>
    );
  } else if (type === "error") {
    return (
      <div className="grid gap-2 grid-flow-col auto-cols-max rounded-lg mt-4 py-3 px-4 bg-red-3 border border-red-4">
        <RiErrorWarningFill className="text-lg text-red-12" />
        <div className="grid">
          <p className="text-red-12 text-sm font-semibold">{title.toUpperCase()}</p>
          <span className="[&>p]:mt-0">{children}</span>
        </div>
      </div>
    );
  }
}
