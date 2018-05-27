import VersionStamper from './stampers/VersionStamper'
import PrepareStamper from './stampers/PrepareStamper'
import ConfigParser from './ConfigParser'

export default class ChangelogVersion {
  /**
   * Facade that interfaces to the changelog classes. Main entry point for the command line.
   * See the respective classes for parameter info.
   **/
  constructor (options = {}) {
    this.options = options
  }

  /**
   * Call this first before calling one of the public facing methods.
   * @returns {Promise<void>}
   */
  async init () {
    const parser = new ConfigParser(this.options)
    this.options = await parser.parseConfig()
  }

  /**
   * Performs the process in which the changelog file is stamped with the
   * latest version / time info.
   * @returns {Promise<void>}
   */
  async release () {
    const stamper = new VersionStamper(this.options)
    await stamper.release()
  }

  /**
   * Performs the process in which the changelog file is stamped with a new
   * unreleased entry, which can later be used by released() to stamp the new
   * version / time info.
   * @returns {Promise<void>}
   */
  async prepare () {
    const stamper = new PrepareStamper(this.options)
    await stamper.stampUnreleased()
  }
}
