import type { MetaFunction } from "@remix-run/node";
import { BackgroundShape1Icon } from "~/components/icons";

export const meta: MetaFunction = () => [
  { title: "Electronics | Spencer Duball" },
  { name: "description", content: "Have a look at some of my electronics projects." },
];

export default function Electronics() {
  return (
    <main className="grid w-full justify-items-center">
      <div className="grid w-full max-w-5xl px-4 py-6">
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
            <BackgroundShape1Icon className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 text-green-4" />
          </div>
        </section>
      </div>
    </main>
  );
}
