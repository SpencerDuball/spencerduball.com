/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
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
              },
            },
          ],
        },
        sm: {
          css: [
            {
              ".multifence": {
                borderRadius: "0.25rem !important",
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
              ".multifence": {
                borderRadius: "0.375rem",
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
