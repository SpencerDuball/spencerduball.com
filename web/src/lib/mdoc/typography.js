/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              pre: {
                backgroundColor: "transparent",
                marginTop: "0 !important",
                marginBottom: "0 !important",
                overflowX: "visible",
              },
              ".multifence": {
                color: "var(--tw-prose-pre-code)",
                backgroundColor: "var(--tw-prose-pre-bg)",
                fontWeight: "400",
              },
              ".fencefile pre": {
                backgroundColor: "transparent",
                marginTop: "0 !important",
                marginBottom: "0 !important",
                paddingTop: "0 !important",
                overflowX: "visible",
              },
            },
          ],
        },
        sm: {
          css: [
            {
              ".fence": {
                borderRadius: "0.25rem !important",
                marginTop: "1.66em",
                marginBottom: "1.66em",
              },
              ".multifence": {
                borderRadius: "0.25rem !important",
                marginTop: "1.66em",
                marginBottom: "1.66em",
              },
              ".multifence-tab": {
                paddingTop: "0.25em !important",
                paddingBottom: "0.25em !important",
                paddingLeft: "1em !important",
                paddingRight: "1em !important",
              },
              ".fencefile": {},
            },
          ],
        },
        base: {
          css: [
            {
              ".fence": {
                borderRadius: "0.375rem",
                marginTop: "1.71em",
                marginBottom: "1.71em",
              },
              ".multifence": {
                borderRadius: "0.375rem",
                marginTop: "1.71em",
                marginBottom: "1.71em",
              },
              ".multifence-tab": {
                paddingTop: "0.25em",
                paddingBottom: "0.25em",
                paddingLeft: "1em",
                paddingRight: "1em",
              },
              ".fencefile": {},
            },
          ],
        },
      },
    },
  },
};
