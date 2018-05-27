import { join } from 'path'
import {
  // node docs does not recommend using the async version
  existsSync
} from 'fs'
import { getValue } from './utils'

const debug = require('debug')('config-parser')

const CONFIG_OPTIONS_TO_SKIP = {
  onBeforeRelease: true,
  onAfterRelease: true,
  projectRoot: true,
  configFile: true
}

/**
 * Parses a config file into options that are consumable by other classes.
 */
export default class ConfigParser {
  /**
   * @param {string} [options.configFile] Name of the changelog config file, relative to projectRoot.
   * Default is '.changelog.js'
   * @param {string} [options.projectRoot] The project root where the package.json and changelog file
   * is found. Default is process.cwd()
   */
  constructor (options = {}) {
    this.options = options
    this.projectRoot = options.projectRoot || process.cwd()
    this.configFile = options.configFile || '.changelog.js'
  }

  /**
   * Reads for a config file and returns the appropriate object for feeding
   * into other classes.
   * @returns {Promise<object>}
   */
  async parseConfig () {
    const configFile = join(this.projectRoot, this.configFile)

    if (existsSync(configFile)) {
      let options = {}
      try {
        options = require(configFile)
      } catch (e) {
        // It's ok if we don't find a config file
        // since it's optional.
        debug('Config file not found: ', configFile)
      }

      try {
        const projectRoot = await getValue(options.projectRoot)

        const newOptions = {
          ...await this._parseOptions(options),
          ...this.options,
          // Speical case: if the config file has projectRoot,
          // use that value instead, even if it's specified on the
          // command line
          projectRoot
        }

        return newOptions
      } catch (e) {
        throw new Error(`Problem parsing config file: ${configFile}`)
      }
    }

    return this.options
  }

  /**
   * Goes through each parameter and resolves the config value, if required.
   * @param {object} options
   * @returns {Promise<object>} Object with resolved values.
   * @private
   */
  async _parseOptions (options) {
    // Have to use for...in because .map does not support
    // await/async
    for (let name in options) {
      const value = options[name]

      // Don't resolve the value if the property is in
      // the skip definitions
      if (CONFIG_OPTIONS_TO_SKIP[name]) {
        continue
      }

      options[name] = await getValue(value)
    }

    return options
  }
}
