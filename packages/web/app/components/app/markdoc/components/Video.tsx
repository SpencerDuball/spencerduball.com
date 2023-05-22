import React from "react";
import type { Schema } from "@markdoc/markdoc";
import ReactPlayer from "react-player";

export const video: Schema = {
  render: "Video",
  attributes: {
    src: { type: String, required: true },
  },
};

export interface VideoProps {
  src: string;
}
export function Video({ src }: VideoProps) {
  const [hasWindow, setHasWindow] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== "undefined") setHasWindow(true);
  }, []);
  return (
    <div className="aspect-video mt-6 p-2 rounded-md border border-slate-6">
      {hasWindow && <ReactPlayer controls width="100%" height="100%" url={src} />}
    </div>
  );
}
