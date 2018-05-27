const debug = require('debug')('getValue')

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

  if (typeof value === 'string') {
    return value
  }

  debug('Value was not a string or function: ', value)
}
