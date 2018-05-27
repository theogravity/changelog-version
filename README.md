# changelog-version

Creates / updates a changelog with customizable options, including version / timestamp.

- Changelog file name
- Where to find your version data
- What your `unreleased` text for replacement should be (eg `[UNRELEASED]`, `*version*`, etc)
- What your release tag should look like (via the `{date}`, `{version}` tags)
- Date formatting via the [`dateformat`](https://www.npmjs.com/package/dateformat) library
- Use a custom config file with additional callback handlers
- Helper command included to create a changelog file + stamp it with the `unreleased` text

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

## Contents

<!-- TOC -->
- [install](#install)
- [CLI Usage](#cli-usage)
  - [prepare](#prepare)
    - [Example 1](#example-1)
    - [Example 2](#example-2)
  - [release](#release)
    - [Example](#example)
- [Custom configuration file](#custom-configuration-file)
  - [Additional properties](#additional-properties)
    - [Release properties](#release-properties)
      - [`async onBeforeRelease`](#async-onbeforerelease)
      - [`async onAfterRelease({ version, date, releaseStamp })`](#async-onafterrelease-version-date-releasestamp-)
- [API](#api)

<!-- TOC END -->

## install

`npm install -g @theo.gravity/changelog-version`

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

  Examples:

    $ changelog-version prepare --newUnreleasedText "## [VERSION_GOES_HERE]\n\n"
    $ changelog-version release --unreleasedTag "[VERSION_GOES_HERE]" --unreleasedTagFormat "{version}"
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
