import dateFormat from 'dateformat'
import { join } from 'path'
import util from 'util'
import { writeFile, readFile } from 'fs'

const debug = require('debug')('changelog')

const readFileAsync = util.promisify(readFile)
const writeFileAsync = util.promisify(writeFile)

export default class ChangelogVersion {
  /**
   * @param {string} options.projectRoot The project root where the package.json and changelog file
   * is found. Default is process.cwd()
   * @param {string} options.changelogFile The relative path to the changelog file from projectRoot.
   * Default is "CHANGELOG.md"
   * @param {string} options.packageFile The relative path to package.json, or a JSON file that
   * contains the "version" field from projectRoot. Default is "package.json"
   * @param {string} options.unreleasedTag The text to find in the changelog which would get
   * replaced with the version / time. Defaults to "[UNRELEASED]"
   * @param {string} options.dateFormat Date mask to use from the "dateformat" library when
   * replacing the versionTag. Default is "default".
   * @param {string} options.tagFormat Format to replace unreleasedTag with. Available tags are
   * "{version}" and "{date}". Default is '{version} - {date}'
   */
  constructor (options = {}) {
    this.projectRoot = options.projectRoot || process.cwd()
    this.changelogFile = options.changelogFile || 'CHANGELOG.md'
    this.packageFile = options.packageFile || 'package.json'
    this.dateFormat = options.dateFormat || 'default'
    this.unreleasedTag = options.unreleasedTag || '[UNRELEASED]'
    this.tagFormat = options.tagFormat || '{version} - {date}'
  }

  /**
   * - Reads the packageFile and finds the "version" field
   * - Reads the changelogFile file and finds the unreleasedTag
   * - Generates the version stamp using tagFormat
   * - Replaces the specified unreleasedTag with tagFormat
   * @return {Promise<void>}
   */
  async release () {
    const fileContents = await this._getFileContents()
    const version = this._getVersion(fileContents.packageFileContents)
    const releaseStamp = this._getReleaseStamp(version)
    const newChangelogData = this._replaceUnreleasedTag(
      fileContents.changelogFileContents,
      releaseStamp
    )

    await this._writeChangelog(newChangelogData)
  }

  /**
   * Writes the changelog with new data
   * @param {string} data
   * @return {Promise<void>}
   * @private
   */
  async _writeChangelog (data) {
    const changelogFilePath = join(this.projectRoot, this.changelogFile)

    try {
      await writeFileAsync(changelogFilePath, data)
    } catch (e) {
      debug(e)
      throw new Error(`Unable to write the changelog file at: ${changelogFilePath}`)
    }
  }

  /**
   * Replaces the specified unreleasedTag in the changelog data with the release stamp
   * @param {string} changelogData The changelog text
   * @param {string} releaseStamp The data to replace unreleasedTag with
   * @return {string} Updated changelog text with the release stamp
   * @private
   */
  _replaceUnreleasedTag (changelogData, releaseStamp) {
    return changelogData.replace(this.unreleasedTag, releaseStamp)
  }

  /**
   * Generates the release tag
   * @returns {string} The generated tag which will be used to replace unreleasedTag.
   * @private
   */
  _getReleaseStamp (version) {
    const date = dateFormat(Date.now(), this.dateFormat)
    let releaseStamp = this.tagFormat.replace('{version}', version)
    releaseStamp = releaseStamp.replace('{date}', date)

    return releaseStamp
  }

  /**
   * Given a JSON string, parses it to an object and returns the "version" value from it.
   * @param {string} jsonData JSON string containing the "version" field
   * @returns {string} The version
   * @private
   */
  _getVersion (jsonData) {
    let obj = null

    try {
      obj = JSON.parse(jsonData)
    } catch (e) {
      debug(e)
      throw new Error('Unable to JSON parse the package file data')
    }

    if (!obj.version) {
      throw new Error('Package file data is missing the "version" field.')
    }

    return obj.version
  }

  /**
   * Gets the raw file data
   * @return {Promise<{changelogFileContents: string, packageFileContents: string}>}
   * @private
   */
  async _getFileContents () {
    const changelogFilePath = join(this.projectRoot, this.changelogFile)
    const packageFilePath = join(this.projectRoot, this.packageFile)

    let changelogFileContents = null
    let packageFileContents = null

    try {
      changelogFileContents = await readFileAsync(changelogFilePath, 'utf8')
    } catch (e) {
      debug(e)
      throw new Error(`Unable to read changelog file at: ${changelogFilePath}`)
    }

    try {
      packageFileContents = await readFileAsync(packageFilePath, 'utf8')
    } catch (e) {
      debug(e)
      throw new Error(`Unable to read package file at: ${changelogFilePath}`)
    }

    return {
      changelogFileContents,
      packageFileContents
    }
  }
}
