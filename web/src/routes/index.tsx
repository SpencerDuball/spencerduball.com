import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, GithubIcon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import { PrintablesIcon } from "@/components/icons";
import { PostLi } from "@/components/post-li";
import { getPostItems } from "@/model/post";

export const Route = createFileRoute("/")({
  loader: async () => {
    const posts = await getPostItems({ data: { start: 0, end: 3 } });
    return { posts };
  },
  component: Component,
});

export function Component() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="grid justify-items-center">
      <div className="grid w-full max-w-4xl gap-10 px-4 py-12">
        {/* Welcome */}
        <section className="grid gap-4 md:grid-flow-col md:grid-cols-[max-content_1fr]">
          <div className="bg-secondary h-32 w-32 border md:h-auto md:w-52" />
          <div className="grid auto-rows-max gap-4">
            <h1 className="text-5xl font-bold">Welcome</h1>
            <p>
              Hello from my corner of the web! I write about web development, homelabs, networks, 3D printing, and more.
              Check out some projects I have worked on, or a series of posts breaking down complex topics. I hope you
              find something that sparks your curiosity.
            </p>
            <div className="inline-grid w-max grid-flow-col items-center gap-2">
              <Button
                variant="outline"
                size="icon-lg"
                className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary"
                render={<a href="https://x.com/SpencerDuball" target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
              >
                <HugeiconsIcon icon={NewTwitterIcon} />
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary"
                render={<a href="https://github.com/SpencerDuball" target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
              >
                <HugeiconsIcon icon={GithubIcon} />
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary text-stone-700 dark:text-stone-300"
                render={
                  <a
                    href="https://www.printables.com/social/212303-spencer_duball/about"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                nativeButton={false}
              >
                <PrintablesIcon />
              </Button>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-b" />

        {/* Posts */}
        <section className="grid gap-6">
          <h1 className="text-2xl font-bold">Posts</h1>
          <div className="grid auto-rows-max gap-6">
            {posts.map((post) => (
              <PostLi key={post.id} data={post} />
            ))}
          </div>
          <Link
            to="/posts/$page"
            params={{ page: 1 }}
            className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary group mt-6 inline-flex w-fit items-center gap-2 py-2 text-lg"
          >
            All Posts
            <HugeiconsIcon
              className="transition-transform duration-200 ease-out group-hover:translate-x-1"
              icon={ArrowRight02Icon}
            />
          </Link>
        </section>
      </div>
    </div>
  );
}
