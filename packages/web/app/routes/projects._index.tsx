import { Link } from "@remix-run/react";
import { RiArrowRightLine } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Projects | Spencer Duball" },
  { name: "description", content: "Check out all of the projects that I work on." },
];

export default function Projects() {
  return (
    <main className="grid w-full justify-items-center">
      <section className="grid w-full max-w-5xl gap-10 px-4 py-6">
        {/* Introduction */}
        <div className="grid max-w-3xl gap-3">
          <h1 className="text-5xl font-extrabold">Projects</h1>
          <p>
            Have a look at some of the things I am working on, I mostly work on software, 3D print some things, and
            occasionally work with electronics.
          </p>
        </div>
        {/* Recent Software */}
        <div className="grid gap-3">
          <h2 className="text-3xl font-extrabold text-blue-11">Software</h2>
          <div className="flex flex-col gap-3 rounded-lg border-2 border-blue-11">
            <div className="grid h-36 w-full place-items-center">
              <p className="text-xl font-bold text-blue-11">Coming Soon!</p>
            </div>
          </div>
          <Link
            className="focus-outline flex items-center justify-self-start text-2xl font-extrabold leading-relaxed text-blue-11"
            to="/projects/software"
          >
            view all <RiArrowRightLine className="ml-2" />
          </Link>
        </div>
        {/* Recent 3D Print */}
        <div className="grid gap-3">
          <h2 className="text-3xl font-extrabold text-orange-11">3D Print</h2>
          <div className="flex flex-col gap-3 rounded-lg border-2 border-orange-11">
            <div className="grid h-36 w-full place-items-center">
              <p className="text-xl font-bold text-orange-11">Coming Soon!</p>
            </div>
          </div>
          <Link
            className="focus-outline flex items-center justify-self-start text-2xl font-extrabold leading-relaxed text-orange-11"
            to="/projects/3d-print"
          >
            view all <RiArrowRightLine className="ml-2" />
          </Link>
        </div>
        {/* Recent Electronics */}
        <div className="grid gap-3">
          <h2 className="text-3xl font-extrabold text-green-11">Electronics</h2>
          <div className="flex flex-col gap-3 rounded-lg border-2 border-green-11">
            <div className="grid h-36 w-full place-items-center">
              <p className="text-xl font-bold text-green-11">Coming Soon!</p>
            </div>
          </div>
          <Link
            className="focus-outline flex items-center justify-self-start text-2xl font-extrabold leading-relaxed text-green-11"
            to="/projects/electronics"
          >
            view all <RiArrowRightLine className="ml-2" />
          </Link>
        </div>
      </section>
    </main>
  );
}
