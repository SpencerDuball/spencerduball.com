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
          gap: 3,
          gridAutoRows: "max",
          rounded: "lg",
          width: "full",
          bgGradient: "to-r",
          gradientFrom: "yellow.a6",
          gradientTo: "crimson.a6",
          p: 8,
          md: {
            justifyContent: "space-between",
            alignItems: "center",
            gridAutoFlow: "column",
            gridAutoColumns: "max",
          },
        }),
        className,
      )}
      {...props}
    >
      <img
        src="/images/profile.webp"
        className={css({
          alignSelf: "start",
          borderRadius: "full",
          width: 24,
          height: 24,
          bg: "gray.3",
          justifySelf: "center",
          md: { width: 32, height: 32, justifySelf: "end" },
        })}
      />
      <div
        className={css({
          display: "grid",
          gap: 3,
          gridAutoRows: "max",
          justifyItems: "center",
          md: {
            gridColumnStart: 1,
            justifyItems: "start",
          },
        })}
      >
        <div className={css({ display: "grid", gap: 1, justifyItems: "center", md: { justifyItems: "start" } })}>
          <h1
            className={css({ textStyle: "3xl", fontWeight: "bold", textJustify: "center", sm: { textStyle: "4xl" } })}
          >
            Spencer Duball
          </h1>
          <p className={css({ textStyle: "md", color: "gray.11", textAlign: "center" })}>Software Engineer</p>
        </div>
        <p className={css({ maxW: "sm", textAlign: "center", md: { textAlign: "start" } })}>
          Web development, cloud computing, 3D printing, designing circuits, and writing about all of these topics.
        </p>
        <div className={css({ display: "grid", gap: 2, gridAutoFlow: "column", gridAutoColumns: "min" })}>
          <a
            className={css({ width: "min", height: "min", p: 2 })}
            href="https://x.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiTwitterXFill className={css({ width: 4, height: 4 })} />
          </a>
          <a
            className={css({ width: "min", height: "min", p: 2 })}
            href="https://github.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiGithubFill className={css({ width: 4, height: 4 })} />
          </a>
          <a
            className={css({ width: "min", height: "min", p: 2 })}
            href="https://www.printables.com/@spencer_dubal_212303"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PrintablesIcon className={css({ width: 4, height: 4 })} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className={css({ display: "grid", width: "full", justifyItems: "center" })}>
      <section className={css({ display: "grid", gap: 10, width: "full", maxW: "5xl", py: 6, px: 4 })}>
        <ProfileCard />
      </section>
    </main>
  );
}
