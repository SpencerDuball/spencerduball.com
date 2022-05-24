import React, { ReactNode } from "react";

/**
 * Genrates an ID from the children of your element. This will extract all strings
 * from your children recursively and build a URL-compliant string.
 *
 * This is commonly used as a link for your headers.
 *
 * @param children The content of your element.
 * @returns
 */
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

const AvgWordsPerMinute = 260;
export function computeReadingTimeOfPost(post: string) {
  // remove all content within custom tags {% %}
  post = post.replace(/{%.*%}/g, "");

  // remove all non-words (except whitespace)
  post = post.replace(/[^a-zA-Z\d\s]/g, "");

  // get word count
  let wordCount = Array.from(post.matchAll(/\w+/g)).length;

  return Math.ceil(wordCount / AvgWordsPerMinute);
}
