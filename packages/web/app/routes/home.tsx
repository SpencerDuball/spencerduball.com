import type { ComponentProps } from "react";
import type { Route } from "./+types/home";
import { css, cx } from "styled-system/css";
import { RiGithubFill, RiTwitterXFill } from "react-icons/ri";
import { PrintablesIcon } from "~/components/app/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home | Spencer Duball" },
    {
      name: "description",
      content:
        "The personal site for Spencer Duball. I write about web development, cloud computing, 3D printing, circuit design, and more!",
    },
  ];
}

/**
 * The profile card component.
 */
function ProfileCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(
        css({
          display: "grid",
          width: "full",
          gridAutoRows: "max",
          gap: 3,
          rounded: "lg",
          bgGradient: "to-r",
          gradientFrom: "yellow.a6",
          gradientTo: "crimson.a6",
          p: 8,
          md: {
            alignItems: "center",
            gridAutoColumns: "max",
            gridAutoFlow: "column",
            justifyContent: "space-between",
          },
        }),
        className,
      )}
      {...props}
    >
      <img
        src="/images/profile.webp"
        className={css({
          height: 24,
          width: 24,
          borderRadius: "full",
          justifySelf: "center",
          alignSelf: "start",
          bg: "gray.3",
          md: { height: 32, width: 32, justifySelf: "end" },
        })}
      />
      <div
        className={css({
          display: "grid",
          gridAutoRows: "max",
          justifyItems: "center",
          gap: 3,
          md: {
            gridColumnStart: 1,
            justifyItems: "start",
          },
        })}
      >
        <div className={css({ display: "grid", justifyItems: "center", gap: 1, md: { justifyItems: "start" } })}>
          <h1
            className={css({ textJustify: "center", textStyle: "3xl", fontWeight: "bold", sm: { textStyle: "4xl" } })}
          >
            Spencer Duball
          </h1>
          <p className={css({ textStyle: "md", textAlign: "center", color: "gray.11" })}>Software Engineer</p>
        </div>
        <p className={css({ maxW: "sm", textAlign: "center", md: { textAlign: "start" } })}>
          Web development, cloud computing, 3D printing, designing circuits, and writing about all of these topics.
        </p>
        <div className={css({ display: "grid", gridAutoColumns: "min", gridAutoFlow: "column", gap: 2 })}>
          <a
            className={css({ height: "min", width: "min", p: 2 })}
            href="https://x.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiTwitterXFill className={css({ height: 4, width: 4 })} />
          </a>
          <a
            className={css({ height: "min", width: "min", p: 2 })}
            href="https://github.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiGithubFill className={css({ height: 4, width: 4 })} />
          </a>
          <a
            className={css({ height: "min", width: "min", p: 2 })}
            href="https://www.printables.com/@spencer_dubal_212303"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PrintablesIcon className={css({ height: 4, width: 4 })} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className={css({ display: "grid", width: "full", justifyItems: "center" })}>
      <section className={css({ display: "grid", width: "full", maxW: "5xl", gap: 10, px: 4, py: 6 })}>
        <ProfileCard />
      </section>
    </main>
  );
}
