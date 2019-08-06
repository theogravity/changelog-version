# 2.1.9 - Tue Aug 06 2019 01:10:24

Update NPM dev deps to fix audit issues.

# 2.1.8 - Thu Sep 20 2018 08:05:15

CI fixes

# 2.1.6 - Thu Sep 20 2018 07:47:58

CI fixes

# 2.1.4 - Thu Sep 20 2018 05:53:39

Update readme with new package version recommendation.

# 2.1.1 - Wed May 30 2018 20:00:10

- Added `--requireUnreleasedEntryFailMsg` to allow the specification of a custom fail message
when using `--requireUnreleasedEntry` or the `validate` command

# 2.1.0 - Wed May 30 2018 08:05:44

The ability to exit with an error code if the changelog lacks the unreleasedTag is now available.

- Added new flag: `--requireUnreleasedEntry`
- Added new command: `changelog-version verify`

# 2.0.12 - Sun May 27 2018 21:42:16

- Fix CI builds

# 2.0.9 - Sun May 27 2018 21:26:39

- Add CI automation to automatically build and publish the package
- Add CI instructions

# 2.0.8 - Sun May 27 2018 03:39:17

- More documentation

# 2.0.1 - Sun May 27 2018 02:28:42

- Fix unit tests
- Use `new Date()` for the date formatter instead of `Date.now()`

# 2.0.0 - Sun May 27 2018 00:23:19

## New major version

The cli now has sub-commands:

- `prepare`: Creates a changelog file if it does not exist, and prepend in the customizable
unreleased line.
- `release`: Finds the unreleased tag and stamps it with actual release info.

# 1.0.8 - Tue May 22 2018 16:57:05

- Add a fail status code on cli failure

# 1.0.7 - Tue May 22 2018 15:07:07

- First version
