/* eslint-env mocha */

import ConfigParser from '../src/ConfigParser'
import { expect } from 'chai'

describe('ConfigParser class', () => {
  it('it should return the original config if no file is used', async () => {
    const configParser = new ConfigParser({
      changelogFile: 'HISTORY.md',
      configFile: 'does-not-exist'
    })

    const options = await configParser.parseConfig()

    expect(options).to.deep.equal({
      changelogFile: 'HISTORY.md',
      configFile: 'does-not-exist'
    })
  })

  it('should parse custom config', async () => {
    const configParser = new ConfigParser({
      projectRoot: process.cwd(),
      configFile: 'fixtures/config-example.js'
    })

    const options = await configParser.parseConfig()

    expect(options).to.deep.equal({
      configFile: 'fixtures/config-example.js',
      projectRoot: process.cwd(),
      changelogFile: 'HISTORY.md',
      newUnreleasedText: '# UNRELEASED\n\n',
      packageFile: 'version.json',
      unreleasedTag: 'UNRELEASED'
    })
  })
})
