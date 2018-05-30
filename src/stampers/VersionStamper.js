import dateFormat from 'dateformat'
import BaseStamper from './BaseStamper'
import { UnreleasedEntryNotFound } from '../errors'

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
   * @param {boolean} [options.requireUnreleasedEntry] If true, will throw an error if the unreleasedTag
   * is not found in the changelog content.
   * @param {string} [options.requireUnreleasedEntryFailMsg] A custom message to render when
   * requireUnreleasedEntry is true and the validation check fails
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
    this.requireUnreleasedEntry = options.requireUnreleasedEntry || false
    this.requireUnreleasedEntryFailMsg = options.requireUnreleasedEntryFailMsg || null

    this.onBeforeRelease = options.onBeforeRelease || function () {}
    this.onAfterRelease = options.onAfterRelease || function () {}
  }

  /**
   * - Throws if requireUnreleasedEntry is true and the release tag is not found
   * - Reads the packageFile and finds the "version" field
   * - Reads the changelogFile file and finds the unreleasedTag
   * - Generates the version stamp using unreleasedTagFormat
   * - Replaces the specified unreleasedTag with unreleasedTagFormat
   * @return {Promise<void>}
   */
  async release () {
    await this.onBeforeRelease()
    const changelogContents = await this._readFileContents(this.changelogFile)
    const packageFileContents = await this._readFileContents(this.packageFile)

    if (this.requireUnreleasedEntry) {
      await this._throwIfReleaseTagNotFound(changelogContents)
    }

    const date = this._getReleaseDate()
    const version = this._getVersion(packageFileContents)
    const releaseStamp = this._getReleaseStamp(version, date)

    const newChangelogData = this._replaceUnreleasedTag(
      changelogContents,
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
   * Replaces the specified unreleasedTag in the changelog data with the release stamp.
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
    return dateFormat(new Date(), this.dateFormat)
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
   * Throws if the release tag was not found
   * @return {Promise<void>}
   */
  async _throwIfReleaseTagNotFound (changelogData) {
    if (!changelogData.includes(this.unreleasedTag)) {
      throw new UnreleasedEntryNotFound(this.unreleasedTag, this.requireUnreleasedEntryFailMsg)
    }
  }

  /**
   * Throws UnreleasedEntryNotFound if the changelog does not contain the unreleasedTag.
   * @return {Promise<void>}
   */
  async verify () {
    const changelogContents = await this._readFileContents(this.changelogFile)
    await this._throwIfReleaseTagNotFound(changelogContents)
  }
}
