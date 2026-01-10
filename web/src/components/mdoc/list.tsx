import Markdoc, { type Schema } from "@markdoc/markdoc";

type ListProps = ({ ordered: true } & React.ComponentProps<"ol">) | ({ ordered: false } & React.ComponentProps<"ul">);

export function List(props: ListProps) {
  if (props.ordered) {
    const { ordered, ...rest } = props;
    return <ol {...rest} />;
  } else {
    const { ordered, ...rest } = props;
    return <ul {...rest} />;
  }
}

export function ListItem(props: React.ComponentProps<"li">) {
  return <li {...props} />;
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
