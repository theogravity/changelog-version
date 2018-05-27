/* eslint-env mocha */

import { expect } from 'chai'
import fsMock from 'mock-fs'
import VersionStamper from '../../src/stampers/VersionStamper'
import { readFile } from 'fs'
import util from 'util'
import { join } from 'path'
import MockDate from 'mockdate'

MockDate.set('1/1/2000')
const readFileAsync = util.promisify(readFile)
const projectRoot = process.cwd()

const defaultChangelogContent = `
# Changelog

## [UNRELEASED]

- I have a change!
`

const defaultVersionContent = '{"version": "1.2.3"}'

describe('VersionStamper class', () => {
  it('should update the changelog with default options', async () => {
    fsMock({
      'CHANGELOG.md': defaultChangelogContent,
      'package.json': defaultVersionContent
    })

    const vs = new VersionStamper()

    await vs.release()

    const data = await readFileAsync(join(projectRoot, 'CHANGELOG.md'), 'utf8')

    expect(data).to.equal(`
# Changelog

## 1.2.3 - Sat Jan 01 2000 00:00:00

- I have a change!
`)

    fsMock.restore()
  })

  it('should update the changelog with a custom change log file', async () => {
    const changelogFile = 'changes.md'

    fsMock({
      [changelogFile]: defaultChangelogContent,
      'package.json': defaultVersionContent
    })

    const vs = new VersionStamper({
      changelogFile
    })

    await vs.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`
# Changelog

## 1.2.3 - Sat Jan 01 2000 00:00:00

- I have a change!
`)

    fsMock.restore()
  })

  it('should pull the version from a file other than package.json', async () => {
    const changelogFile = 'CHANGELOG.md'
    const packageFile = 'version'

    fsMock({
      [changelogFile]: defaultChangelogContent,
      [packageFile]: '{"version": "4.4.6"}'
    })

    const vs = new VersionStamper({
      packageFile
    })

    await vs.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`
# Changelog

## 4.4.6 - Sat Jan 01 2000 00:00:00

- I have a change!
`)

    fsMock.restore()
  })

  it('should use an alternate UNRELEASED tag', async () => {
    const changelogFile = 'CHANGELOG.md'
    const packageFile = 'package.json'

    fsMock({
      [changelogFile]: '# UNRELEASED',
      [packageFile]: '{"version": "4.4.6"}'
    })

    const vs = new VersionStamper({
      unreleasedTag: 'UNRELEASED'
    })

    await vs.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`# 4.4.6 - Sat Jan 01 2000 00:00:00`)

    fsMock.restore()
  })

  it('should use an alternate tag format', async () => {
    const changelogFile = 'CHANGELOG.md'
    const packageFile = 'package.json'

    fsMock({
      [changelogFile]: defaultChangelogContent,
      [packageFile]: defaultVersionContent
    })

    const vs = new VersionStamper({
      unreleasedTagFormat: '{date} / {version}'
    })

    await vs.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`
# Changelog

## Sat Jan 01 2000 00:00:00 / 1.2.3

- I have a change!
`)

    fsMock.restore()
  })

  it('should use a custom date format', async () => {
    const changelogFile = 'CHANGELOG.md'
    const packageFile = 'package.json'

    fsMock({
      [changelogFile]: defaultChangelogContent,
      [packageFile]: defaultVersionContent
    })

    const vs = new VersionStamper({
      dateFormat: 'MM'
    })

    await vs.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`
# Changelog

## 1.2.3 - 00

- I have a change!
`)

    fsMock.restore()
  })
})
