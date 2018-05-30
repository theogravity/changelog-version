# changelog-version

[![CircleCI](https://circleci.com/gh/theogravity/changelog-version.svg?style=svg)](https://circleci.com/gh/theogravity/changelog-version)
[![npm version](https://badge.fury.io/js/%40theo.gravity%2Fchangelog-version.svg)](https://badge.fury.io/js/%40theo.gravity%2Fchangelog-version)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Creates / updates a changelog with customizable options, including version / timestamp / CI support.

## What it offers

- Changelog file name
- Where to find your version data
- What your `unreleased` text for replacement should be (eg `[UNRELEASED]`, `*version*`, etc)
- What your release tag should look like (via the `{date}`, `{version}` tags)
- Date formatting via the [`dateformat`](https://www.npmjs.com/package/dateformat) library
- Use a custom config file with additional callback handlers
- Helper command included to create a changelog file + stamp it with the `unreleased` text
- Examples on how to auto-increment your logs and publish to npm in your CI

Turn this (the format can be customized):

```
# Changelog

## [UNRELEASED]

- I have a change!
```

into this:

```
# Changelog

## 1.2.3 - Wed May 04 2016 04:27:29

- I have a change!
```

## What it will not do

- Version bumping `package.json`. [`npm version`](https://docs.npmjs.com/cli/version) can do that job.
Your `package.json` file must have the new version you want to stamp the changelog with before running
`changelog-version release`.
- Commit changes to your VCS.

## Contents

<!-- TOC -->
- [Install](#install)
- [Quick start usage](#quick-start-usage)
  - [Mark a new unreleased entry into the changelog](#mark-a-new-unreleased-entry-into-the-changelog)
  - [Stamp the changelog with the current version + time from package.json](#stamp-the-changelog-with-the-current-version--time-from-packagejson)
- [CLI Usage](#cli-usage)
  - [prepare](#prepare)
    - [Example 1](#example-1)
    - [Example 2](#example-2)
  - [release](#release)
    - [Example](#example)
  - [Verify](#verify)
- [Custom configuration file](#custom-configuration-file)
  - [Additional properties](#additional-properties)
    - [Release properties](#release-properties)
      - [`async onBeforeRelease`](#async-onbeforerelease)
      - [`async onAfterRelease({ version, date, releaseStamp })`](#async-onafterrelease-version-date-releasestamp-)
- [API](#api)
- [CI Integration](#ci-integration)
  - [Auto-versioning + publishing in your CI](#auto-versioning--publishing-in-your-ci)
    - [CircleCI](#circleci)

<!-- TOC END -->

## Install

`npm install -g @theo.gravity/changelog-version`

## Quick start usage

### Mark a new unreleased entry into the changelog

`changelog-version prepare`

### Stamp the changelog with the current version + time from package.json

`changelog-version release`

## CLI Usage

```
$ changelog-version

  Usage: changelog-version <command> [options]

  Utility for creating and updating a changelog file.
  Use "<command> --help" for additional options.

  Options:

    -V, --version               output the version number
    --configFile [fileName]     Name of the optional config file, relative to projectRoot.
                                        Default is ".changelog.js".
    --projectRoot [path]        The project root where the package.json and changelog file is found.
                                        Default is process.cwd().
    --changelogFile [fileName]  The relative path to the changelog file from projectRoot.
                                        Default is "CHANGELOG.md".
    -h, --help                  output usage information

  Commands:

    prepare [options]           Stamp the changelog with an unreleased marker.
      Optionally to be used prior to the "release" command.
      A new file (defined by --changelogFile) will be created if one does not exist.
    release [options]           Stamp the changelog with the version / date info.

      You do *NOT* have to use "changelog-version prepare" before using this command.
    verify [options]            Verifies that the changelog contains the unreleasedTag.
      Returns with an error status if the changelog does not have it.

      Useful to run as part of a pre-commit hook.

  Examples:

    $ changelog-version prepare --newUnreleasedText "## [VERSION_GOES_HERE]\n\n"
    $ changelog-version release --unreleasedTag "[VERSION_GOES_HERE]" --unreleasedTagFormat "{version}"
    $ changelog-version verify
```

### prepare

```
$ changelog-version prepare --help

  Usage: prepare [options]

  Stamp the changelog with an unreleased marker.
  Optionally to be used prior to the "release" command.
  A new file (defined by --changelogFile) will be created if one does not exist.

  Options:

    --newUnreleasedText [textToPrepend]  The text to prepend to the log file.
                                           Default is "# [UNRELEASED]\n\n".
    -h, --help                           output usage information
```

#### Example 1

Running `changelog-version prepare` in an empty directory will create the file `CHANGELOG.md` with the following:

```
# [UNRELEASED]


```

#### Example 2

You have a `CHANGELOG.md` with the following content:

```
# 1.2.3

- New release
```

Running `changelog-version prepare` will update `CHANGELOG.md` with:

```
# [UNRELEASED]

# 1.2.3

- New release
```

### release

```
$ changelog-version release --help

  Usage: release [options]

  Stamp the changelog with the version / date info.

  You do *NOT* have to use "changelog-version prepare" before using this command.

  Options:

    --packageFile [fileName]         The relative path to package.json, or a JSON file that
                                        contains the "version" field from projectRoot.
                                        Default is "package.json".
    --unreleasedTag [textToReplace]  The text to find in the changelog which would get
                                        replaced with the version / time.
                                        Default is "[UNRELEASED]".
    --unreleasedTagFormat [format]   Format to replace unreleasedTag with.
                                        Available tags are "{version}" and "{date}".
                                        Default is '{version} - {date}'.
    --dateFormat [format]            Date mask to use from the "dateformat" library when
                                        replacing the versionTag.
                                        Default is "default".
    -h, --help                       output usage information
```

#### Example

- You used `changelog-version prepare` in the prior step and added in your release notes
- You have a `package.json` that contains `{"version": "1.2.3"}`

current `CHANGELOG.md`:

```
# [UNRELEASED]

* New feature!

```

Running `changelog-version release` will update `CHANGELOG.md` with:

```
# 1.2.3 - <current date>

* New feature!
```

### Verify

```
$ changelog-version verify --help

  Usage: verify [options]

  Verifies that the changelog contains the unreleasedTag.
  Returns with an error status if the changelog does not have it.

  Useful to run as part of a pre-commit hook.

  Options:

    --unreleasedTag [textToLookFor]  The text to find in the changelog.
                                        Default is "[UNRELEASED]".
    -h, --help                       output usage information
```

## Custom configuration file

To spare yourself from having to specify command line options each time, you can use a custom config file.

Place `.changelog.js` in the root of your project.

(The file name can be configured with the `--configFile` option, which is relative to `--projectRoot`.)

If detected, `changelog-version` will derive options from this file.

With the exception of `projectRoot`, options defined on the command line will take
precedence.

```js
// This is an optional configuration file
// you can use with changelog-version.
// If specified, any command line args has priority over the
// values returned in this file.

// All values are optional.
// Do not use the ES6 export default
// since the file is imported using require()
// See command line options for additional available properties
module.exports = {
  /**
   * This is called before doing the version stamping.
   * @returns {Promise<void>}
   */
  onBeforeRelease: async () => {},
  /**
   * This is called after the version stamping is complete.
   * @param {string} version Release version that the changelog stamp used
   * @param {string} date Formatted date that the changelog stamp used
   * @param {string} releaseStamp Release text that the changelog was stamped with
   * @returns {Promise<void>}
   */
  onAfterRelease: async ({ version, date, releaseStamp } = {}) => {},

  // Values can either be text
  // or a (async) function that returns text

  // ==== Common options ====
  // If specified here, this will have priority
  // over the command line option projectRoot
  // once this file is read.
  projectRoot: () => {
    return process.cwd()
  },
  changelogFile: () => {
    return 'CHANGELOG.md'
  },
  // ==== Options specific to prepare ====
  newUnreleasedText: '# UNRELEASED\n\n',

  // ==== Options specific to release ====
  packageFile: async () => {
    return 'package.json'
  },
  // see https://www.npmjs.com/package/dateformat
  // for options
  dateFormat: 'default',
  unreleasedTag: () => {
    return 'UNRELEASED'
  },
  unreleasedTagFormat: '{date} - {version}'
}
```

### Additional properties

Aside from the command line options, the config file offers additional properties:

#### Release properties

##### `async onBeforeRelease`

Called before the release. Use this to do any pre-setup that you need to do.

##### `async onAfterRelease({ version, date, releaseStamp })`

Called after the changelog has been updated.

```
   * @param {string} version Release version that the changelog stamp used
   * @param {string} date Formatted date that the changelog stamp used
   * @param {string} releaseStamp Release text that the changelog was stamped with
```

## API

- See `src` for the API.
- See the `test` directory for API usage samples.

## CI Integration

### Auto-versioning + publishing in your CI

Make sure you have `changelog-version` and
[`npm-version-git-cli`](https://www.npmjs.com/package/npm-version-git-cli) installed
locally into your project.

`npm install npm-version-git-cli @theo.gravity/changelog-version --dev`

#### CircleCI

This repo uses CircleCI to automatically version stamp the `CHANGELOG.md` file and
publish to npm with the new version.

See the `.circleci/` directory for auto release log stamping, version bumping and npm publishing.

The following `package.json` script is used in conjunction with the CircleCI flow:

```json
{
  "scripts": {
      "release-log": "changelog-version release",
      "prepare-publish": "npm-version-git-cli && npm run release-log"
  }
}
```
