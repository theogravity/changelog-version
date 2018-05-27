/* eslint-env mocha */

import { expect } from 'chai'
import fsMock from 'mock-fs'
import ChangelogVersion from '../src/ChangelogVersion'
import { readFile, existsSync } from 'fs'
import util from 'util'
import { join } from 'path'
import MockDate from 'mockdate'

MockDate.set('1/1/2000')

const readFileAsync = util.promisify(readFile)
const projectRoot = process.cwd()

const defaultChangelogStamp = `# [UNRELEASED]

`

const defaultChangelogContent = `
# Changelog

## [UNRELEASED]

- I have a change!
`

const defaultVersionContent = '{"version": "1.2.3"}'

describe('ChangelogVersion class', () => {
  it('should prepare a changelog', async () => {
    fsMock({})

    const cv = new ChangelogVersion()
    await cv.init()
    await cv.prepare()

    expect(existsSync('CHANGELOG.md')).to.equal(true)
    const data = await readFileAsync(join(projectRoot, 'CHANGELOG.md'), 'utf8')
    expect(data).to.equal(defaultChangelogStamp)
    fsMock.restore()
  })

  it('should release a changelog', async () => {
    fsMock({
      'CHANGELOG.md': defaultChangelogContent,
      'package.json': defaultVersionContent
    })

    const cv = new ChangelogVersion()
    await cv.init()
    await cv.release()

    const data = await readFileAsync(join(projectRoot, 'CHANGELOG.md'), 'utf8')

    expect(data).to.equal(`
# Changelog

## 1.2.3 - Sat Jan 01 2000 00:00:00

- I have a change!
`)

    fsMock.restore()
  })

  it('should use a custom changelog config file', async () => {
    const cv = new ChangelogVersion({
      projectRoot: process.cwd(),
      configFile: 'fixtures/config-example.js'
    })

    await cv.init()

    expect(cv.options).to.deep.equal({
      configFile: 'fixtures/config-example.js',
      projectRoot: process.cwd(),
      changelogFile: 'HISTORY.md',
      newUnreleasedText: '# UNRELEASED\n\n',
      packageFile: 'version.json',
      unreleasedTag: 'UNRELEASED'
    })

    fsMock.restore()
  })
})
