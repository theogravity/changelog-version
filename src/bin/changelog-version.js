#!/usr/bin/env node

import program from 'commander'
import ChangelogVersion from '../ChangelogVersion'

const packageData = require('../../package.json')

program
  .version(packageData.version)
  .usage('[options]')
  .option('--projectRoot [path]', `The project root where the package.json and changelog file is found.
                                    Default is process.cwd()`)
  .option('--changelogFile [fileName]', `The relative path to the changelog file from projectRoot.
                                    Default is "CHANGELOG.md"`)
  .option('--packageFile [fileName]', `The relative path to package.json, or a JSON file that
                                    contains the "version" field from projectRoot.
                                    Default is "package.json".`)
  .option('--unreleasedTag [textToReplace]', `The text to find in the changelog which would get 
                                    replaced with the version / time. Defaults to "[UNRELEASED]".`)
  .option('--dateFormat [format]', `Date mask to use from the "dateformat" library when
                                    replacing the versionTag. Default is "default".`)
  .option('--tagFormat [format]', `Format to replace unreleasedTag with. Available tags are
                                    "{version}" and "{date}". Default is '{version} - {date}'.`)
  .parse(process.argv)

const cv = new ChangelogVersion(program)

cv.release()
  .then(() => {
    console.log('Updated changelog.')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(-1)
  })
