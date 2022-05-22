import React, { ReactNode } from "react";

export function generateIdFromText(children: ReactNode): string {
  if (children) {
    switch (typeof children) {
      case "string":
        return children.replace(/[?]/g, "").replace(/\s+/g, "-").toLowerCase();
      case "number":
      case "boolean":
        return children.toString();
      case "object": {
        if ("props" in children && children.props.children) {
          return generateIdFromText(children.props.children);
        } else {
          let childrenStrings = React.Children.map(children, (child) =>
            generateIdFromText(child)
          );
          if (childrenStrings)
            return childrenStrings
              .reduce((prev, curr) => prev + curr, "")
              .replace(/[?]/g, "")
              .replace(/\s+/g, "-")
              .toLowerCase();
          else return "";
        }
      }
    }
  } else return "";
}
