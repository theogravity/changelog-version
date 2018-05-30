import { readFile } from 'fs'
import util from 'util'

const readFileAsync = util.promisify(readFile)

const debug = require('debug')('utils')

/**
 * This is mainly used for parsing options, since each config parameter can be
 * either a string or function.
 * - If a value is a function, execute and return it.
 * - If a value is text, return it
 * @param {function|string} value
 * @param {object} [options] Options to feed into the value, if it is a function
 * @returns {Promise<*>}
 */
export async function getValue (value, options = {}) {
  if (typeof value === 'function') {
    return value(options)
  }

  if (typeof value === 'string' || typeof value === 'boolean') {
    return value
  }

  debug('getValue(): Value was not a string or function: ', value)
}

/**
 * Gets the raw file data
 * @param {string} filePath Full path of the file to read
 * @return {Promise<{string}>} Contents of the file
 */
export async function getFileContents (filePath) {
  if (!filePath) {
    throw new Error('_getFileContents() requires the file name.')
  }

  let fileContents = null

  try {
    fileContents = await readFileAsync(filePath, 'utf8')
  } catch (e) {
    debug(e)
    throw new Error(`Unable to read file at: ${filePath}`)
  }

  return fileContents
}
