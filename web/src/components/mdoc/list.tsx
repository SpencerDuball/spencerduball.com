import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

type ListProps = ({ ordered: true } & React.ComponentProps<"ol">) | ({ ordered: false } & React.ComponentProps<"ul">);

export function List(props: ListProps) {
  if (props.ordered) {
    const { ordered, className, ...rest } = props;
    return <ol className={cn("", className)} {...rest} />;
  } else {
    const { ordered, className, ...rest } = props;
    return <ul className={cn("", className)} {...rest} />;
  }
}

export function ListItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />;
}

export const list: Schema = {
  attributes: {
    ordered: { type: Boolean, required: true, default: false },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("List", attributes, children);
  },
};

export const item: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("ListItem", attributes, children);
  },
};
