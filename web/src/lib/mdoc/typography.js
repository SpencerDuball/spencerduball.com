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
                borderWidth: "1px",
                borderColor: "var(--color-gray-700)",
              },
              ".multifence div:first-of-type": {
                backgroundColor: "var(--color-gray-900)",
              },
              ".multifence hr": {
                borderColor: "var(--color-gray-700)",
              },
              ".fencefile": {
                backgroundColor: "var(--tw-prose-pre-bg)",
              },
            },
          ],
        },
        sm: {
          css: [
            {
              ".multifence": {},
              ".multifence div:first-of-type": {
                paddingTop: "0.25rem",
                paddingBottom: "0.25rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              },
              ".multifence hr": {
                marginTop: "0",
                marginBottom: "0",
              },
              ".fencefile": {},
            },
          ],
        },
        base: {
          css: [
            {
              ".multifence": {},
              ".multifence div:first-of-type": {
                paddingTop: "0.25rem",
                paddingBottom: "0.25rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              },
              ".multifence hr": {
                marginTop: "0",
                marginBottom: "0",
              },
              ".fencefile": {},
            },
          ],
        },
      },
    },
  },
};
