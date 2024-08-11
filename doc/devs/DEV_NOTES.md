# Dev Notes

This file will be used to track all of the little things in a project that are "good-to-know", and workarounds for common issues noticed.

## VSCode Prettier

Note that in `/package.json` we have installed `prettier@^3.x.x`, this is necessary to get the VSCode Prettier extension working properly. Without this, we will run into a cluster of ESM vs CJS issues due to the configuration file. These issues only really present because custom prettier settings are specified. As an example: See the documentation for the VSCode Prettier extension here describing this necessary package:

- https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode#prettier-version-3
