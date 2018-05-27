import dateFormat from 'dateformat'
import BaseStamper from './BaseStamper'

const debug = require('debug')('version-stamper')

export default class VersionStamper extends BaseStamper {
  /**
   * Finds the unreleased tag in a changelog file and stamps it with the version / time info.
   *
   * @param {string} [options.packageFile] The relative path to package.json, or a JSON file that
   * contains the "version" field from projectRoot. Default is "package.json"
   * @param {string} [options.unreleasedTag] The text to find in the changelog which would get
   * replaced with the version / time. Defaults to "[UNRELEASED]"
   * @param {string} [options.dateFormat] Date mask to use from the "dateformat" library when
   * replacing the versionTag. Default is "default".
   * @param {string} [options.unreleasedTagFormat] Format to replace unreleasedTag with. Available tags are
   * "{version}" and "{date}". Default is '{version} - {date}'
   * @param {function} [options.onBeforeRelease] This is called before doing the version stamping.
   * @param {function} [options.onAfterRelease] This is called after the version stamping is complete.
   * This function is called with the following params:
   *  - version: Release version that the changelog stamp used
   *  - date: Formatted date that the changelog stamp used
   *  - releaseStamp: Release text that the changelog was stamped with
   */
  constructor (options = {}) {
    super(options)
    this.packageFile = options.packageFile || 'package.json'
    this.dateFormat = options.dateFormat || 'default'
    this.unreleasedTag = options.unreleasedTag || '[UNRELEASED]'
    this.unreleasedTagFormat = options.unreleasedTagFormat || '{version} - {date}'

    this.onBeforeRelease = options.onBeforeRelease || function () {}
    this.onAfterRelease = options.onAfterRelease || function () {}
  }

  /**
   * - Reads the packageFile and finds the "version" field
   * - Reads the changelogFile file and finds the unreleasedTag
   * - Generates the version stamp using unreleasedTagFormat
   * - Replaces the specified unreleasedTag with unreleasedTagFormat
   * @return {Promise<void>}
   */
  async release () {
    await this.onBeforeRelease()
    const fileContents = await this._getDataForFiles()
    const date = this._getReleaseDate()
    const version = this._getVersion(fileContents.packageFileContents)
    const releaseStamp = this._getReleaseStamp(version, date)
    const newChangelogData = this._replaceUnreleasedTag(
      fileContents.changelogFileContents,
      releaseStamp
    )

    await this._writeChangelog(newChangelogData)
    await this.onAfterRelease({
      version,
      date,
      releaseStamp
    })
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
   * Returns the formatted release date.
   * @returns {string}
   * @private
   */
  _getReleaseDate () {
    return dateFormat(Date.now(), this.dateFormat)
  }

  /**
   * Generates the release tag
   * @returns {string} The generated tag which will be used to replace unreleasedTag.
   * @private
   */
  _getReleaseStamp (version, releaseDate) {
    let releaseStamp = this.unreleasedTagFormat.replace('{version}', version)
    releaseStamp = releaseStamp.replace('{date}', releaseDate)

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
   * Gets the raw file data for the changelog and version file
   * @return {Promise<{changelogFileContents: string, packageFileContents: string}>}
   * @private
   */
  async _getDataForFiles () {
    // note: _readFileContents already throws the appropriate error message
    // if something goes wrong, so no need to catch and log here
    return {
      changelogFileContents: await this._readFileContents(this.changelogFile),
      packageFileContents: await this._readFileContents(this.packageFile)
    }
  }
}
