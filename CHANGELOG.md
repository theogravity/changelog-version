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
