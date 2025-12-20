import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import { PrintablesIcon } from "@/components/icons";
import { BlogLi } from "@/components/blog-li";

export const Route = createFileRoute("/")({
  component: Component,
});

export function Component() {
  return (
    <div className="grid justify-items-center">
      <div className="grid w-full max-w-5xl gap-10 px-4 py-12">
        {/* Welcome */}
        <section className="grid grid-flow-col grid-cols-[max-content_1fr] gap-4">
          <div className="bg-secondary h-56 w-56"></div>
          <div className="grid auto-rows-max gap-4">
            <h1 className="text-5xl font-bold">Welcome</h1>
            <p>
              Hello from my corner of the web! I write about web development, homelabs, networks, 3D printing, and more.
              Check out some projects I have worked on, or curated series of posts breaking down complex topics. I hope
              you find something that sparks your curiosity.
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

        {/* Featured */}
        <section className="grid auto-rows-max gap-6">
          <h1 className="text-2xl font-bold">Featured</h1>
          <div className="grid max-w-[80ch] auto-rows-max gap-6">
            <BlogLi
              data={{
                title: "Aenean luctus a dolor ut ultrices.",
                summary:
                  "Aenean luctus a dolor ut ultrices. Vivamus accumsan auctor odio, sed consequat erat lacinia ut. Nulla gravida dignissim cursus. Sed non dapibus enim. Mauris molestie, massa dapibus tincidunt semper, odio ex tincidunt arcu, ut dignissim lacus dui id sapien. Nulla quis ultrices erat. Fusce massa velit, vehicula id velit et, luctus facilisis diam.",
                created: new Date(),
              }}
            />
            <BlogLi
              data={{
                title: "Duis varius ipsum et nisl aliquet consectetur. Etiam ut nulla ligula.",
                summary:
                  "Duis varius ipsum et nisl aliquet consectetur. Etiam ut nulla ligula. Fusce dignissim ligula vitae ligula placerat semper. In rhoncus placerat ex, et vestibulum tellus porta id.",
                created: new Date(),
              }}
            />
            <BlogLi
              data={{
                title: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae",
                summary:
                  "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Quisque at dignissim odio, et volutpat massa. Nunc quis dolor ac ligula placerat imperdiet a ac quam. Nam ultricies massa vitae nulla iaculis maximus. Quisque sed dignissim lacus. Quisque pulvinar felis at est feugiat, quis dignissim diam ornare. Suspendisse potenti.",
                created: new Date(),
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
