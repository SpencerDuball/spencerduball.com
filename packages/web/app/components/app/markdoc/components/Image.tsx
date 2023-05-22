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
    <div className="p-2 rounded-md border border-slate-6 mt-6">
      <img className="object-cover w-full h-full" src={src} alt={alt} title={title} />
    </div>
  );
}
