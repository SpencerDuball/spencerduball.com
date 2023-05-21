import * as React from "react";

const PrintablesIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => (
  <svg ref={ref} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20 128L64.3815 102.4L20 76.8V128Z" fill="currentColor" />
    <path d="M64.3815 0L20 25.6L64.3815 51.2V102.4L108.763 76.8V25.6L64.3815 0Z" fill="currentColor" />
  </svg>
));

const TimeAscIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => (
  <svg ref={ref} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M7.5 14C4.46235 14 2 11.5377 2 8.5C2 5.46235 4.46235 3 7.5 3C10.5377 3 13 5.46235 13 8.5C13 11.5377 10.5377 14 7.5 14ZM7.5 12.9C8.66695 12.9 9.78611 12.4364 10.6113 11.6113C11.4364 10.7861 11.9 9.66695 11.9 8.5C11.9 7.33305 11.4364 6.21389 10.6113 5.38873C9.78611 4.56357 8.66695 4.1 7.5 4.1C6.33305 4.1 5.21389 4.56357 4.38873 5.38873C3.56357 6.21389 3.1 7.33305 3.1 8.5C3.1 9.66695 3.56357 10.7861 4.38873 11.6113C5.21389 12.4364 6.33305 12.9 7.5 12.9ZM8.05 8.5H10.25V9.6H6.95V5.75H8.05V8.5Z"
      fill="currentColor"
    />
    <path
      d="M13.5 0L16 2.49941L15.1663 3.33314L14.0892 2.25607V5.54678H12.9108V2.25489L11.8337 3.33314L11 2.49941L13.5 0Z"
      fill="currentColor"
    />
  </svg>
));

const TimeDescIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => (
  <svg ref={ref} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M7.5 14C4.46235 14 2 11.5377 2 8.5C2 5.46235 4.46235 3 7.5 3C10.5377 3 13 5.46235 13 8.5C13 11.5377 10.5377 14 7.5 14ZM7.5 12.9C8.66695 12.9 9.78611 12.4364 10.6113 11.6113C11.4364 10.7861 11.9 9.66695 11.9 8.5C11.9 7.33305 11.4364 6.21389 10.6113 5.38873C9.78611 4.56357 8.66695 4.1 7.5 4.1C6.33305 4.1 5.21389 4.56357 4.38873 5.38873C3.56357 6.21389 3.1 7.33305 3.1 8.5C3.1 9.66695 3.56357 10.7861 4.38873 11.6113C5.21389 12.4364 6.33305 12.9 7.5 12.9ZM8.05 8.5H10.25V9.6H6.95V5.75H8.05V8.5Z"
      fill="currentColor"
    />
    <path
      d="M13.5 5.54678L16 3.04737L15.1663 2.21365L14.0892 3.29071V-5.4928e-07H12.9108V3.29189L11.8337 2.21365L11 3.04737L13.5 5.54678Z"
      fill="currentColor"
    />
  </svg>
));

const ViewsAscIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => (
  <svg ref={ref} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M7.5 4C10.2411 4 12.5216 5.97246 13 8.57528C12.5221 11.1781 10.2411 13.1506 7.5 13.1506C4.7589 13.1506 2.47837 11.1781 2 8.57528C2.47786 5.97246 4.7589 4 7.5 4ZM7.5 12.1338C8.53679 12.1336 9.54281 11.7815 10.3534 11.135C11.164 10.4885 11.7311 9.58605 11.9619 8.57528C11.7302 7.56532 11.1627 6.66383 10.3522 6.01822C9.54175 5.37261 8.5362 5.02107 7.5 5.02107C6.4638 5.02107 5.45825 5.37261 4.64776 6.01822C3.83726 6.66383 3.26978 7.56532 3.03808 8.57528C3.26893 9.58605 3.83605 10.4885 4.64662 11.135C5.45719 11.7815 6.46321 12.1336 7.5 12.1338ZM7.5 10.8629C6.89328 10.8629 6.31141 10.6219 5.88239 10.1929C5.45338 9.76388 5.21236 9.182 5.21236 8.57528C5.21236 7.96856 5.45338 7.38669 5.88239 6.95768C6.31141 6.52866 6.89328 6.28764 7.5 6.28764C8.10672 6.28764 8.68859 6.52866 9.11761 6.95768C9.54662 7.38669 9.78764 7.96856 9.78764 8.57528C9.78764 9.182 9.54662 9.76388 9.11761 10.1929C8.68859 10.6219 8.10672 10.8629 7.5 10.8629ZM7.5 9.8462C7.83707 9.8462 8.16033 9.7123 8.39867 9.47395C8.63701 9.23561 8.77091 8.91235 8.77091 8.57528C8.77091 8.23822 8.63701 7.91496 8.39867 7.67661C8.16033 7.43827 7.83707 7.30437 7.5 7.30437C7.16293 7.30437 6.83967 7.43827 6.60133 7.67661C6.36299 7.91496 6.22909 8.23822 6.22909 8.57528C6.22909 8.91235 6.36299 9.23561 6.60133 9.47395C6.83967 9.7123 7.16293 9.8462 7.5 9.8462Z"
      fill="currentColor"
    />
    <path
      d="M13.5 0L16 2.49941L15.1663 3.33314L14.0892 2.25607V5.54678H12.9108V2.25489L11.8337 3.33314L11 2.49941L13.5 0Z"
      fill="currentColor"
    />
  </svg>
));

const ViewsDescIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => (
  <svg ref={ref} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M7.5 4C10.2411 4 12.5216 5.97246 13 8.57528C12.5221 11.1781 10.2411 13.1506 7.5 13.1506C4.7589 13.1506 2.47837 11.1781 2 8.57528C2.47786 5.97246 4.7589 4 7.5 4ZM7.5 12.1338C8.53679 12.1336 9.54281 11.7815 10.3534 11.135C11.164 10.4885 11.7311 9.58605 11.9619 8.57528C11.7302 7.56532 11.1627 6.66383 10.3522 6.01822C9.54175 5.37261 8.5362 5.02107 7.5 5.02107C6.4638 5.02107 5.45825 5.37261 4.64776 6.01822C3.83726 6.66383 3.26978 7.56532 3.03808 8.57528C3.26893 9.58605 3.83605 10.4885 4.64662 11.135C5.45719 11.7815 6.46321 12.1336 7.5 12.1338ZM7.5 10.8629C6.89328 10.8629 6.31141 10.6219 5.88239 10.1929C5.45338 9.76388 5.21236 9.182 5.21236 8.57528C5.21236 7.96856 5.45338 7.38669 5.88239 6.95768C6.31141 6.52866 6.89328 6.28764 7.5 6.28764C8.10672 6.28764 8.68859 6.52866 9.11761 6.95768C9.54662 7.38669 9.78764 7.96856 9.78764 8.57528C9.78764 9.182 9.54662 9.76388 9.11761 10.1929C8.68859 10.6219 8.10672 10.8629 7.5 10.8629ZM7.5 9.8462C7.83707 9.8462 8.16033 9.7123 8.39867 9.47395C8.63701 9.23561 8.77091 8.91235 8.77091 8.57528C8.77091 8.23822 8.63701 7.91496 8.39867 7.67661C8.16033 7.43827 7.83707 7.30437 7.5 7.30437C7.16293 7.30437 6.83967 7.43827 6.60133 7.67661C6.36299 7.91496 6.22909 8.23822 6.22909 8.57528C6.22909 8.91235 6.36299 9.23561 6.60133 9.47395C6.83967 9.7123 7.16293 9.8462 7.5 9.8462Z"
      fill="currentColor"
    />
    <path
      d="M13.5 5.54678L16 3.04737L15.1663 2.21365L14.0892 3.29071V-5.4928e-07H12.9108V3.29189L11.8337 2.21365L11 3.04737L13.5 5.54678Z"
      fill="currentColor"
    />
  </svg>
));

const BackgroundShape1Icon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => (
  <svg ref={ref} viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M203.603 227.509C202.927 228.132 202.125 228.443 201.197 228.443C200.216 228.443 199.374 228.132 198.671 227.509C197.968 226.885 197.432 225.997 197.06 224.844C196.689 223.69 196.504 222.318 196.504 220.727C196.504 219.123 196.689 217.751 197.06 216.611C197.432 215.457 197.968 214.569 198.671 213.946C199.374 213.323 200.216 213.011 201.197 213.011C202.125 213.011 202.927 213.323 203.603 213.946C204.279 214.569 204.803 215.457 205.174 216.611C205.545 217.751 205.731 219.123 205.731 220.727C205.731 222.318 205.545 223.69 205.174 224.844C204.803 225.997 204.279 226.885 203.603 227.509Z"
      fill="currentColor"
    />
    <path
      d="M344.538 226.972C343.822 227.528 342.96 227.807 341.952 227.807C340.945 227.807 340.083 227.535 339.367 226.991C338.665 226.435 338.121 225.633 337.737 224.585C337.365 223.525 337.18 222.239 337.18 220.727C337.18 219.216 337.365 217.923 337.737 216.849C338.121 215.762 338.665 214.934 339.367 214.364C340.083 213.78 340.945 213.489 341.952 213.489C342.96 213.489 343.822 213.78 344.538 214.364C345.267 214.934 345.824 215.762 346.208 216.849C346.606 217.923 346.805 219.216 346.805 220.727C346.805 222.212 346.606 223.485 346.208 224.545C345.824 225.593 345.267 226.402 344.538 226.972Z"
      fill="currentColor"
    />
    <path
      d="M226.08 295.509C225.403 296.132 224.601 296.443 223.673 296.443C222.692 296.443 221.85 296.132 221.148 295.509C220.445 294.885 219.908 293.997 219.537 292.844C219.166 291.69 218.98 290.318 218.98 288.727C218.98 287.123 219.166 285.751 219.537 284.611C219.908 283.457 220.445 282.569 221.148 281.946C221.85 281.323 222.692 281.011 223.673 281.011C224.601 281.011 225.403 281.323 226.08 281.946C226.756 282.569 227.279 283.457 227.651 284.611C228.022 285.751 228.207 287.123 228.207 288.727C228.207 290.318 228.022 291.69 227.651 292.844C227.279 293.997 226.756 294.885 226.08 295.509Z"
      fill="currentColor"
    />
    <path
      d="M261.08 295.509C260.403 296.132 259.601 296.443 258.673 296.443C257.692 296.443 256.85 296.132 256.148 295.509C255.445 294.885 254.908 293.997 254.537 292.844C254.166 291.69 253.98 290.318 253.98 288.727C253.98 287.123 254.166 285.751 254.537 284.611C254.908 283.457 255.445 282.569 256.148 281.946C256.85 281.323 257.692 281.011 258.673 281.011C259.601 281.011 260.403 281.323 261.08 281.946C261.756 282.569 262.279 283.457 262.651 284.611C263.022 285.751 263.207 287.123 263.207 288.727C263.207 290.318 263.022 291.69 262.651 292.844C262.279 293.997 261.756 294.885 261.08 295.509Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M278.793 35.0324L282.961 32.4768C316.617 11.839 357.545 6.73994 395.236 18.4891C452.419 36.3145 491.368 89.2531 491.368 149.15V155.25C491.368 187.796 480.252 219.366 459.86 244.731L452.921 253.362C425.314 287.703 418.078 334.143 433.929 375.255L445.061 404.127C450.808 419.033 449.84 435.693 442.406 449.833C430.28 472.899 403.717 484.394 378.602 477.446L354.194 470.693C349.122 469.29 343.933 468.35 338.691 467.887L288.285 463.43C263.409 461.23 238.415 466.075 216.163 477.411C200.686 485.294 183.816 490.072 166.504 491.474L112.827 495.821C80.7583 498.419 49.6326 484.218 30.5762 458.294C16.1118 438.618 9.98789 414.032 13.5325 389.869L18.0795 358.875C20.9102 339.579 27.7768 321.097 38.2314 304.634L63.9655 264.109C85.4354 230.3 79.3448 185.928 49.5591 159.155L46.9836 156.84C31.3195 142.759 22.3733 122.689 22.3733 101.626V95.8295C22.3733 60.823 48.9985 31.5596 83.8494 28.262C95.2065 27.1874 106.651 28.9929 117.126 33.5116L143.141 44.7344C187.245 63.7602 237.847 60.141 278.793 35.0324ZM170.01 210.545H181.226C181.014 208.013 180.41 205.766 179.416 203.804C178.422 201.842 177.109 200.191 175.479 198.852C173.848 197.5 171.952 196.473 169.791 195.77C167.63 195.067 165.264 194.716 162.692 194.716C159.033 194.716 155.718 195.518 152.749 197.122C149.779 198.713 147.419 201.066 145.669 204.182C143.919 207.284 143.044 211.102 143.044 215.636C143.044 220.144 143.899 223.955 145.609 227.071C147.333 230.187 149.673 232.546 152.629 234.151C155.599 235.755 158.953 236.557 162.692 236.557C165.675 236.557 168.293 236.099 170.547 235.185C172.801 234.27 174.69 233.063 176.214 231.565C177.752 230.054 178.939 228.41 179.774 226.634C180.609 224.844 181.093 223.087 181.226 221.364L170.01 221.284C169.877 222.159 169.619 222.948 169.234 223.651C168.863 224.34 168.379 224.93 167.783 225.42C167.186 225.911 166.483 226.289 165.675 226.554C164.866 226.806 163.951 226.932 162.93 226.932C161.141 226.932 159.609 226.514 158.337 225.679C157.064 224.83 156.089 223.571 155.413 221.901C154.75 220.217 154.419 218.129 154.419 215.636C154.419 213.277 154.744 211.255 155.393 209.571C156.056 207.887 157.024 206.595 158.297 205.693C159.583 204.792 161.154 204.341 163.01 204.341C164.071 204.341 165.018 204.493 165.854 204.798C166.689 205.09 167.398 205.514 167.982 206.071C168.578 206.615 169.042 207.264 169.374 208.02C169.718 208.776 169.93 209.617 170.01 210.545ZM187.177 229.06C188.436 231.42 190.246 233.262 192.606 234.588C194.966 235.901 197.803 236.557 201.117 236.557C204.432 236.557 207.269 235.901 209.629 234.588C211.988 233.262 213.798 231.42 215.058 229.06C216.317 226.687 216.947 223.936 216.947 220.807C216.947 217.678 216.317 214.934 215.058 212.574C213.798 210.201 211.988 208.358 209.629 207.045C207.269 205.72 204.432 205.057 201.117 205.057C197.803 205.057 194.966 205.72 192.606 207.045C190.246 208.358 188.436 210.201 187.177 212.574C185.917 214.934 185.288 217.678 185.288 220.807C185.288 223.936 185.917 226.687 187.177 229.06ZM221.401 205.455V236H232.379V218.182C232.379 217.294 232.524 216.531 232.816 215.895C233.121 215.245 233.545 214.748 234.089 214.403C234.632 214.059 235.282 213.886 236.038 213.886C237.178 213.886 238.086 214.271 238.762 215.04C239.438 215.795 239.776 216.843 239.776 218.182V236H250.276V218.182C250.276 216.843 250.601 215.795 251.251 215.04C251.914 214.271 252.808 213.886 253.935 213.886C255.076 213.886 255.984 214.271 256.66 215.04C257.336 215.795 257.674 216.843 257.674 218.182V236H268.651V215.398C268.651 212.269 267.736 209.763 265.907 207.881C264.091 205.998 261.718 205.057 258.788 205.057C256.521 205.057 254.545 205.627 252.861 206.767C251.178 207.894 250.077 209.392 249.56 211.261H249.242C248.924 209.392 247.989 207.894 246.438 206.767C244.887 205.627 243.038 205.057 240.89 205.057C238.769 205.057 236.939 205.614 235.401 206.727C233.863 207.841 232.776 209.352 232.14 211.261H231.822V205.455H221.401ZM274.065 205.455V236H285.043V205.455H274.065ZM275.736 200.801C276.796 201.782 278.069 202.273 279.554 202.273C281.052 202.273 282.325 201.782 283.372 200.801C284.433 199.82 284.963 198.64 284.963 197.261C284.963 195.883 284.433 194.703 283.372 193.722C282.325 192.741 281.052 192.25 279.554 192.25C278.069 192.25 276.796 192.741 275.736 193.722C274.675 194.703 274.145 195.883 274.145 197.261C274.145 198.64 274.675 199.82 275.736 200.801ZM301.613 236V218.818C301.626 217.811 301.812 216.949 302.17 216.233C302.528 215.504 303.038 214.947 303.701 214.562C304.377 214.165 305.166 213.966 306.067 213.966C307.446 213.966 308.52 214.397 309.289 215.259C310.071 216.12 310.456 217.307 310.442 218.818V236H321.42V216.511C321.433 214.297 320.996 212.329 320.107 210.605C319.232 208.882 317.993 207.529 316.388 206.548C314.798 205.554 312.922 205.057 310.761 205.057C308.52 205.057 306.558 205.607 304.874 206.707C303.204 207.808 302.037 209.326 301.374 211.261H301.056V205.455H290.636V236H301.613ZM333.68 246.778C335.867 247.653 338.492 248.091 341.555 248.091C344.776 248.091 347.594 247.614 350.006 246.659C352.419 245.705 354.289 244.319 355.614 242.503C356.953 240.7 357.623 238.506 357.623 235.92V205.455H346.646V210.784H346.407C346.009 209.75 345.426 208.802 344.657 207.94C343.888 207.065 342.933 206.369 341.793 205.852C340.653 205.322 339.327 205.057 337.816 205.057C335.801 205.057 333.879 205.594 332.049 206.668C330.233 207.741 328.748 209.432 327.594 211.739C326.454 214.045 325.884 217.042 325.884 220.727C325.884 224.254 326.428 227.111 327.515 229.298C328.615 231.486 330.074 233.083 331.89 234.091C333.719 235.098 335.721 235.602 337.896 235.602C339.274 235.602 340.54 235.417 341.694 235.045C342.847 234.661 343.835 234.111 344.657 233.395C345.479 232.666 346.089 231.784 346.487 230.75H346.805V235.92C346.805 237.723 346.334 238.97 345.393 239.659C344.465 240.348 343.291 240.693 341.873 240.693C341.038 240.693 340.282 240.6 339.606 240.415C338.943 240.242 338.399 239.957 337.975 239.56C337.551 239.162 337.286 238.638 337.18 237.989H326.6C326.746 239.951 327.415 241.687 328.609 243.199C329.815 244.723 331.505 245.917 333.68 246.778ZM191.885 272.898C192.773 273.64 193.27 274.674 193.376 276H203.956C203.943 273.335 203.28 271.009 201.967 269.02C200.668 267.018 198.819 265.467 196.419 264.366C194.019 263.266 191.176 262.716 187.888 262.716C184.666 262.716 181.809 263.259 179.317 264.347C176.838 265.434 174.895 266.952 173.49 268.901C172.098 270.836 171.409 273.097 171.422 275.682C171.409 278.864 172.436 281.376 174.504 283.219C176.586 285.048 179.429 286.354 183.035 287.136L187.092 288.011C188.604 288.343 189.803 288.701 190.692 289.085C191.58 289.456 192.216 289.881 192.601 290.358C192.999 290.822 193.204 291.366 193.217 291.989C193.204 292.652 192.992 293.241 192.581 293.759C192.17 294.276 191.567 294.68 190.771 294.972C189.976 295.263 188.988 295.409 187.808 295.409C186.403 295.409 185.19 295.19 184.169 294.753C183.161 294.315 182.379 293.672 181.822 292.824C181.266 291.975 180.954 290.928 180.888 289.682H170.388C170.401 293.089 171.13 295.886 172.575 298.074C174.034 300.248 176.075 301.859 178.7 302.906C181.339 303.954 184.428 304.477 187.967 304.477C191.414 304.477 194.364 303.993 196.817 303.026C199.283 302.058 201.178 300.646 202.504 298.79C203.83 296.934 204.5 294.667 204.513 291.989C204.5 290.437 204.248 289.006 203.757 287.693C203.28 286.381 202.531 285.201 201.51 284.153C200.489 283.093 199.177 282.171 197.572 281.389C195.968 280.607 194.039 279.977 191.785 279.5L188.445 278.784C187.477 278.585 186.642 278.36 185.939 278.108C185.236 277.856 184.66 277.578 184.209 277.273C183.758 276.955 183.427 276.603 183.214 276.219C183.016 275.821 182.929 275.377 182.956 274.886C182.969 274.29 183.148 273.759 183.493 273.295C183.838 272.831 184.368 272.467 185.084 272.202C185.813 271.923 186.748 271.784 187.888 271.784C189.678 271.784 191.01 272.155 191.885 272.898ZM209.653 297.06C210.913 299.419 212.723 301.262 215.082 302.588C217.442 303.901 220.279 304.557 223.594 304.557C226.908 304.557 229.745 303.901 232.105 302.588C234.465 301.262 236.275 299.419 237.534 297.06C238.794 294.687 239.423 291.936 239.423 288.807C239.423 285.678 238.794 282.934 237.534 280.574C236.275 278.201 234.465 276.358 232.105 275.045C229.745 273.72 226.908 273.057 223.594 273.057C220.279 273.057 217.442 273.72 215.082 275.045C212.723 276.358 210.913 278.201 209.653 280.574C208.394 282.934 207.764 285.678 207.764 288.807C207.764 291.936 208.394 294.687 209.653 297.06ZM244.653 297.06C245.913 299.419 247.723 301.262 250.082 302.588C252.442 303.901 255.279 304.557 258.594 304.557C261.908 304.557 264.745 303.901 267.105 302.588C269.465 301.262 271.275 299.419 272.534 297.06C273.794 294.687 274.423 291.936 274.423 288.807C274.423 285.678 273.794 282.934 272.534 280.574C271.275 278.201 269.465 276.358 267.105 275.045C264.745 273.72 261.908 273.057 258.594 273.057C255.279 273.057 252.442 273.72 250.082 275.045C247.723 276.358 245.913 278.201 244.653 280.574C243.394 282.934 242.764 285.678 242.764 288.807C242.764 291.936 243.394 294.687 244.653 297.06ZM278.878 304H289.855V286.818C289.868 285.811 290.054 284.949 290.412 284.233C290.77 283.504 291.28 282.947 291.943 282.562C292.619 282.165 293.408 281.966 294.31 281.966C295.688 281.966 296.762 282.397 297.531 283.259C298.313 284.12 298.698 285.307 298.685 286.818V304H309.662V284.511C309.675 282.297 309.238 280.329 308.349 278.605C307.474 276.882 306.235 275.529 304.631 274.548C303.04 273.554 301.164 273.057 299.003 273.057C296.762 273.057 294.8 273.607 293.116 274.707C291.446 275.808 290.279 277.326 289.616 279.261H289.298V273.455H278.878V304ZM317.706 291.273H326.774L327.808 263.273H316.672L317.706 291.273ZM318.283 303.026C319.383 304.099 320.702 304.636 322.24 304.636C323.221 304.636 324.129 304.391 324.964 303.901C325.8 303.397 326.476 302.727 326.993 301.892C327.523 301.044 327.795 300.102 327.808 299.068C327.795 297.557 327.225 296.264 326.098 295.19C324.984 294.116 323.698 293.58 322.24 293.58C320.702 293.58 319.383 294.116 318.283 295.19C317.196 296.264 316.659 297.557 316.672 299.068C316.659 300.619 317.196 301.938 318.283 303.026Z"
      fill="currentColor"
    />
  </svg>
));

export { PrintablesIcon, TimeAscIcon, TimeDescIcon, ViewsDescIcon, ViewsAscIcon, BackgroundShape1Icon };
