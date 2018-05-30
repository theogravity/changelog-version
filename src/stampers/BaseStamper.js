import { writeFile } from 'fs'
import util from 'util'
import { join } from 'path'
import { getFileContents } from '../utils'

const writeFileAsync = util.promisify(writeFile)

const debug = require('debug')('base-stamper')

/**
 * Contains methods that are common to stampers.
 * A stamper is a class that modifies a changelog in some fashion.
 */
export default class BaseStamper {
  constructor (options = {}) {
    this.projectRoot = options.projectRoot || process.cwd()
    this.changelogFile = options.changelogFile || 'CHANGELOG.md'
  }

  /**
   * Writes the changelog with new data.
   * @param {string} data
   * @return {Promise<void>}
   * @protected
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
   * Gets the raw file data
   * @return {Promise<string>} Contents of the file
   * @protected
   */
  async _readFileContents (file) {
    if (!file) {
      throw new Error('_getFileContents() requires the file name.')
    }

    const filePath = join(this.projectRoot, file)

    return getFileContents(filePath)
  }
}
