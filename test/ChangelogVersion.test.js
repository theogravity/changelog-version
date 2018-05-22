/* eslint-env mocha */

import { expect } from 'chai'
import fsMock from 'mock-fs'
import ChangelogVersion from '../src/ChangelogVersion'
import { readFile } from 'fs'
import util from 'util'
import { join } from 'path'

const readFileAsync = util.promisify(readFile)
const projectRoot = process.cwd()

Date.now = () => {
  // 4th May 2016 04:27:29
  return 1462361249717
}

const defaultChangelogContent = `
# Changelog

## [UNRELEASED]

- I have a change!
`

const defaultVersionContent = '{"version": "1.2.3"}'

describe('ChangelogVersion class', () => {
  it('should update the changelog with default options', async () => {
    fsMock({
      'CHANGELOG.md': defaultChangelogContent,
      'package.json': defaultVersionContent
    })

    const cv = new ChangelogVersion()

    await cv.release()

    const data = await readFileAsync(join(projectRoot, 'CHANGELOG.md'), 'utf8')

    expect(data).to.equal(`
# Changelog

## 1.2.3 - Wed May 04 2016 04:27:29

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

    const cv = new ChangelogVersion({
      changelogFile
    })

    await cv.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`
# Changelog

## 1.2.3 - Wed May 04 2016 04:27:29

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

    const cv = new ChangelogVersion({
      packageFile
    })

    await cv.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`
# Changelog

## 4.4.6 - Wed May 04 2016 04:27:29

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

    const cv = new ChangelogVersion({
      unreleasedTag: 'UNRELEASED'
    })

    await cv.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`# 4.4.6 - Wed May 04 2016 04:27:29`)

    fsMock.restore()
  })

  it('should use an alternate tag format', async () => {
    const changelogFile = 'CHANGELOG.md'
    const packageFile = 'package.json'

    fsMock({
      [changelogFile]: defaultChangelogContent,
      [packageFile]: defaultVersionContent
    })

    const cv = new ChangelogVersion({
      tagFormat: '{date} / {version}'
    })

    await cv.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`
# Changelog

## Wed May 04 2016 04:27:29 / 1.2.3

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

    const cv = new ChangelogVersion({
      dateFormat: 'MM'
    })

    await cv.release()

    const data = await readFileAsync(join(projectRoot, changelogFile), 'utf8')

    expect(data).to.equal(`
# Changelog

## 1.2.3 - 27

- I have a change!
`)

    fsMock.restore()
  })
})
