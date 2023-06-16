import { BackgroundShape1Icon } from "~/components/ui/icon";
import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => [
  { title: "Electronics | Spencer Duball" },
  { name: "description", content: "Have a look at some of my electronics projects." },
];

export default function Electronics() {
  return (
    <div className="grid w-full max-w-5xl py-6 px-4">
      {/* Introduction */}
      <section className="grid max-w-3xl gap-3">
        <h1 className="text-5xl font-extrabold leading-snug text-green-11">Electronics</h1>
        <p className="text-green-12">
          Check out some of the electronics projects I have worked on from raspberry pi, arduino, to custom PCBs.
        </p>
      </section>
      {/* Content */}
      <section className="grid h-full w-full">
        <div className="relative w-full pt-[100%]">
          <BackgroundShape1Icon className="absolute top-1/2 left-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 text-green-4" />
        </div>
      </section>
    </div>
  );
}
