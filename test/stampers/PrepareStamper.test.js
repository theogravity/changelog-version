/* eslint-env mocha */

import { expect } from 'chai'
import fsMock from 'mock-fs'
import PrepareStamper from '../../src/stampers/PrepareStamper'
import { readFile, existsSync } from 'fs'
import util from 'util'
import { join } from 'path'

const readFileAsync = util.promisify(readFile)
const projectRoot = process.cwd()

const defaultChangelogStamp = `# [UNRELEASED]

`

describe('PrepareStamper class', () => {
  it('should create the changelog if it does not exist with a new stamp', async () => {
    fsMock({})

    const ps = new PrepareStamper()
    await ps.stampUnreleased()

    expect(existsSync('CHANGELOG.md')).to.equal(true)
    const data = await readFileAsync(join(projectRoot, 'CHANGELOG.md'), 'utf8')
    expect(data).to.equal(defaultChangelogStamp)
    fsMock.restore()
  })

  it('should add a stamp to an existing changelog file', async () => {
    fsMock({
      'CHANGELOG.md': `# 1.2.3`
    })

    const ps = new PrepareStamper()
    await ps.stampUnreleased()

    const data = await readFileAsync(join(projectRoot, 'CHANGELOG.md'), 'utf8')
    expect(data).to.equal(`${defaultChangelogStamp}# 1.2.3`)
    fsMock.restore()
  })

  it('should not add a stamp to an existing changelog file if the stamp already exists', async () => {
    fsMock({
      'CHANGELOG.md': defaultChangelogStamp
    })

    const ps = new PrepareStamper()
    await ps.stampUnreleased()

    const data = await readFileAsync(join(projectRoot, 'CHANGELOG.md'), 'utf8')
    expect(data).to.equal(defaultChangelogStamp)
    fsMock.restore()
  })

  it('should allow for a custom unreleased text', async () => {
    fsMock({
      'CHANGELOG.md': '# a.b.c'
    })

    const ps = new PrepareStamper({
      newUnreleasedText: '# [NEW_RELEASE]\n\n'
    })
    await ps.stampUnreleased()

    const data = await readFileAsync(join(projectRoot, 'CHANGELOG.md'), 'utf8')
    expect(data).to.equal(`# [NEW_RELEASE]\n\n# a.b.c`)
    fsMock.restore()
  })
})
