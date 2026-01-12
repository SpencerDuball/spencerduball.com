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
