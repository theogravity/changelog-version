#!/usr/bin/env node

import program from 'commander'
import ChangelogVersion from '../ChangelogVersion'
import { UnreleasedEntryNotFound } from '../errors'

const packageData = require('../../package.json')

program
  .version(packageData.version)
  .usage('<command> [options]')
  .description(`Utility for creating and updating a changelog file.
  Use "<command> --help" for additional options.`)
  .option('--configFile [fileName]', `Name of the optional config file, relative to projectRoot.
                                    Default is ".changelog.js".`)
  .option('--projectRoot [path]', `The project root where the package.json and changelog file is found.
                                    Default is process.cwd().`)
  .option('--changelogFile [fileName]', `The relative path to the changelog file from projectRoot.
                                    Default is "CHANGELOG.md".`)

program
  .command('prepare')
  .description(`Stamp the changelog with an unreleased marker.
  Optionally to be used prior to the "release" command.
  A new file (defined by --changelogFile) will be created if one does not exist.`)
  .option('--newUnreleasedText [textToPrepend]', `The text to prepend to the log file.
                                       Default is "# [UNRELEASED]\\n\\n".`)
  .action(async function (action, opt) {
    await runPrepare(opt)
  })

program
  .command('release')
  .description(`Stamp the changelog with the version / date info.

  You do *NOT* have to use "changelog-version prepare" before using this command.`)
  .option('--requireUnreleasedEntry', `If present, will exit with an error code if the 
                                    unreleasedTag is not found in the changelog file.`)
  .option('--packageFile [fileName]', `The relative path to package.json, or a JSON file that
                                    contains the "version" field from projectRoot.
                                    Default is "package.json".`)
  .option('--unreleasedTag [textToReplace]', `The text to find in the changelog which would get 
                                    replaced with the version / time.
                                    Default is "[UNRELEASED]".`)
  .option('--unreleasedTagFormat [format]', `Format to replace unreleasedTag with.
                                    Available tags are "{version}" and "{date}".
                                    Default is '{version} - {date}'.`)
  .option('--dateFormat [format]', `Date mask to use from the "dateformat" library when
                                    replacing the versionTag.
                                    Default is "default".`)
  .action(async function (action, opt) {
    await runRelease(opt)
  })

program
  .command('verify')
  .description(`Verifies that the changelog contains the unreleasedTag.
  Returns with an error status if the changelog does not have it.
  
  Useful to run as part of a pre-commit hook.`)
  .option('--unreleasedTag [textToLookFor]', `The text to find in the changelog.
                                    Default is "[UNRELEASED]".`)
  .action(async function (action, opt) {
    await runVerify(opt)
  })

program.on('--help', function () {
  console.log('')
  console.log('  Examples:')
  console.log('')
  console.log('    $ changelog-version prepare --newUnreleasedText "## [VERSION_GOES_HERE]\\n\\n"')
  console.log('    $ changelog-version release --unreleasedTag "[VERSION_GOES_HERE]" --unreleasedTagFormat "{version}"')
  console.log('    $ changelog-version verify')
  console.log('')
})

program.parse(process.argv)

if (!program.args.length) {
  showHelp()
}

function showHelp () {
  program.help()
  process.exit(-2)
}

async function runPrepare (options) {
  try {
    const cv = new ChangelogVersion(options)
    await cv.init()
    await cv.prepare()
    console.log('Changelog prepared for new release notes.')
  } catch (e) {
    handleError(e)
  }
}

async function runRelease (options) {
  try {
    const cv = new ChangelogVersion(options)
    await cv.init()
    await cv.release()
    console.log('Changelog updated with release information.')
    process.exit(0)
  } catch (e) {
    handleError(e)
  }
}

async function runVerify (options = {}) {
  try {
    const cv = new ChangelogVersion(options)
    await cv.init()
    await cv.verify()

    console.log(`Changelog contains the unreleasedTag entry.`)

    process.exit(0)
  } catch (e) {
    handleError(e)
  }
}

function handleError (e) {
  if (e instanceof UnreleasedEntryNotFound) {
    console.error(e.message)
    process.exit(-3)
  }

  console.error(e)
  process.exit(-1)
}
