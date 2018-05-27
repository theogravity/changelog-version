import { join } from 'path'
import util from 'util'

import {
  open,
  close,
  // node docs does not recommend using the async version
  existsSync
} from 'fs'
import BaseStamper from './BaseStamper'

const openFileAsync = util.promisify(open)
const closeFileAsync = util.promisify(close)

const debug = require('debug')('unreleased-stamper')

export default class PrepareStamper extends BaseStamper {
  /**
   * Prepends a changelog file with the specified unreleased format.
   *
   * @param {string} [options.newUnreleasedText] The text to prepend to the log file.
   * Default is "# [UNRELEASED]\\n\\n".
   * @param options
   */
  constructor (options = {}) {
    super(options)

    this.newUnreleasedText = options.newUnreleasedText || '# [UNRELEASED]\n\n'
  }

  /**
   * Prepends the unreleased text to the changelog file. If the file does not exist,
   * create it.
   * @returns {Promise<void>}
   */
  async stampUnreleased () {
    await this._createChangelogFileIfNotExists()

    let changelogContents = await this._readFileContents(this.changelogFile)

    // don't do any changes if the stamp already exists
    if (!changelogContents.includes(this.newUnreleasedText)) {
      changelogContents = this.newUnreleasedText + changelogContents

      await this._writeChangelog(changelogContents)
    }
  }

  /**
   * Creates the changelog file if it does not exist
   * @returns {Promise<void>}
   * @private
   */
  async _createChangelogFileIfNotExists () {
    const changelogFile = join(this.projectRoot, this.changelogFile)

    if (!existsSync(changelogFile)) {
      try {
        const fd = await openFileAsync(changelogFile, 'w')
        await closeFileAsync(fd)
      } catch (e) {
        debug(e)
        throw new Error(`Unable to create the changelog file: ${changelogFile}`)
      }
    }
  }
}
