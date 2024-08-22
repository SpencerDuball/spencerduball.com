# Publish

Publish this as an npm package. Some design decisions:

- [ ] Add support for tracking applied/not applied seeds in the database.
- [ ] Add support for users to supply a CLI path to different config files, with the default looking in the project root and then the `.config` folder.
  - [ ] Add support for the users to specify a different default `migrationsFolder` and `seedFolder`
  - Allowing different config files to be supplied means users can have different seed folders.
- [ ] Use `import "tsx/esm"` so TS/JS modules can be loaded dynamically.
  - Have an import for the `Config`.
  - Have an optional import for the `seed/reset.ts` which can be used to teardown any resources. Is this necessary, will the `down` commands be enough?
    - Might be able to have a reset command that just force runs all of the `down` scripts. There should be safeguards that ensure no errors in the down scripts to be run in any case.
  - For each seed, export a variable `export const needsMigration = '1823019439_some_migration';` which states that without this migration the seed should not run. This will also be helpful when performing migrations down as we can check this variable and remove seeds depending on their needed migrations.
