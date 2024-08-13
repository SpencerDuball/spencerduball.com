import { BackgroundShape1Icon } from "~/components/icons";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Software | Spencer Duball" },
  { name: "description", content: "Have a look at some of my software projects." },
];

export default function Software() {
  return (
    <main className="grid w-full justify-items-center">
      <div className="grid w-full max-w-5xl px-4 py-6">
        {/* Introduction */}
        <section className="grid max-w-3xl gap-3">
          <h1 className="text-5xl font-extrabold leading-snug text-blue-11">Software</h1>
          <p className="text-blue-12">
            Check out some of the software I have worked on from open source software to full projects.
          </p>
        </section>
        {/* Content */}
        <section className="grid h-full w-full">
          <div className="relative w-full pt-[100%]">
            <BackgroundShape1Icon className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 text-blue-4" />
          </div>
        </section>
      </div>
    </main>
  );
}
