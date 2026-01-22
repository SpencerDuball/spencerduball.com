import { Link as TsrLink } from "@tanstack/react-router";

export function Link({ href, ...props }: React.ComponentProps<"a">) {
  const isExternalHref = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href || "#");

  if (isExternalHref) return <a target="_blank" rel="noopener noreferrer" href={href} {...props} />;

  return <TsrLink to={href} {...props} />;
}
