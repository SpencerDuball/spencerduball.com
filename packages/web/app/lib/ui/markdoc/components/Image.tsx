import type { Schema } from "@markdoc/markdoc";

export const image: Schema = {
  render: "Image",
  attributes: {
    src: { type: String, required: true },
    alt: { type: String },
    title: { type: String },
  },
};

export interface ImageProps {
  src: string;
  alt?: string;
  title?: string;
}
export function Image({ src, alt, title }: ImageProps) {
  return (
    <div className="mt-6 rounded-md border border-slate-6 p-2">
      <img className="h-full w-full object-cover" src={src} alt={alt} title={title} />
    </div>
  );
}
