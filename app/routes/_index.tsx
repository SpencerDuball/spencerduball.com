import * as React from "react";
import type { MetaFunction } from "@remix-run/node";
import { Types, GlobalCtx } from "~/context/global-ctx";
import { RiTwitterXFill, RiGithubFill, RiArrowRightLine } from "react-icons/ri";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui";
import { PrintablesIcon } from "~/components/icons";

export const meta: MetaFunction = () => {
  return [
    { title: "Home | Spencer Duball" },
    {
      name: "description",
      content:
        "The personal site for Spencer Duball. I write about web development, cloud computing, 3D printing, circuit design, and more!",
    },
  ];
};

export default function Index() {
  const [{ preferences }, dispatch] = React.useContext(GlobalCtx);

  return (
    <main className="grid w-full justify-items-center">
      <section className="grid w-full max-w-5xl gap-10 px-4 py-6">
        {/* Profile Card */}
        <div className="md:align-items-center grid w-full auto-rows-max gap-3 rounded-lg bg-gradient-to-r from-yellowa-6 to-crimsona-6 p-8 dark:from-yellowdarka-6 dark:to-crimsondarka-6 md:auto-cols-max md:grid-flow-col md:justify-between">
          <Avatar className="h-24 w-24 justify-self-center md:h-32 md:w-32 md:justify-self-end">
            <AvatarImage src="/images/profile.webp" alt="A profile photo of Spencer Duball" />
            <AvatarFallback>SD</AvatarFallback>
          </Avatar>
          <div className="grid auto-rows-max justify-items-center gap-3 md:col-start-1 md:justify-items-start">
            <div className="grid justify-items-center gap-1 md:justify-items-start">
              <h1 className="text-center text-3xl font-bold sm:text-4xl">Spencer Duball</h1>
              <p className="text-md text-center text-slate-11 dark:text-slatedark-11">Software Engineer</p>
            </div>
            <p className="max-w-sm text-center md:text-start">
              Web development, cloud computing, 3D printing, designing circuits, and writing about all of these topics.
            </p>
            <div className="grid auto-cols-min grid-flow-col gap-2">
              <a
                className="focus-outline h-min w-min p-2"
                href="https://twitter.com/SpencerDuball"
                target="_blank"
                rel="noopener noreferrer"
              >
                <RiTwitterXFill className="h-4 w-4" />
              </a>
              <a
                className="focus-outline h-min w-min p-2"
                href="https://github.com/SpencerDuball"
                target="_blank"
                rel="noopener noreferrer"
              >
                <RiGithubFill className="h-4 w-4" />
              </a>
              <a
                className="focus-outline h-min w-min p-2"
                href="https://www.printables.com/social/212303-spencer_duball/about"
                target="_blank"
                rel="noopener noreferrer"
              >
                <PrintablesIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        {/* Recent Blogs */}
        {/* <div className="grid gap-2">
        <h1 className="text-md px-3 font-bold uppercase text-slate-10">Latest Posts</h1>
        <div className="grid gap-2">
          {parsedBlogs.map((blog) => (
            <BlogLi key={blog.id} data={blog} />
          ))}
        </div>
        <Link
          className="focus-outline flex items-center justify-self-end text-xl font-extrabold leading-relaxed text-slate-9 hover:text-slate-11"
          to="/blog"
        >
          view all posts <RiArrowRightLine className="ml-2" />
        </Link>
      </div> */}
      </section>
    </main>
  );
}
