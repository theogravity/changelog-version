# changelog-version

Update the changelog version / timestamp with customizable options:

- Changelog file name
- Where to find your version data
- What your release tag should look like (via the `{date}`, `{version}` tags)

Using the default options, a file named `CHANGELOG.md` with the following content:

```
# Changelog

## [UNRELEASED]

- I have a change!
```

becomes:

```
# Changelog

## 1.2.3 - Wed May 04 2016 04:27:29

- I have a change!
```

## install

`npm install -g @theo.gravity/changelog-version`

## Usage

```
$ changelog-version --help

  Usage: changelog-version [options]

  Options:

    -V, --version                    output the version number
    --projectRoot [path]             The project root where the package.json and changelog file is found.
                                        Default is process.cwd()
    --changelogFile [fileName]       The relative path to the changelog file from projectRoot.
                                        Default is "CHANGELOG.md"
    --packageFile [fileName]         The relative path to package.json, or a JSON file that
                                        contains the "version" field from projectRoot.
                                        Default is "package.json".
    --unreleasedTag [textToReplace]  The text to find in the changelog which would get
                                        replaced with the version / time. Defaults to "[UNRELEASED]".
    --dateFormat [format]            Date mask to use from the "dateformat" library when
                                        replacing the versionTag. Default is "default".
    --tagFormat [format]             Format to replace unreleasedTag with. Available tags are
                                        "{version}" and "{date}". Default is "{version} - {date}".
    -h, --help                       output usage information
```

## API

- See `src/ChangelogVersion.js` for the API.
- See the test directory for API usage samples.
