module.exports = {
  projectRoot: () => {
    return process.cwd()
  },
  changelogFile: () => {
    return 'HISTORY.md'
  },
  newUnreleasedText: '# UNRELEASED\n\n',
  packageFile: async () => {
    return 'version.json'
  },
  unreleasedTag: () => {
    return 'UNRELEASED'
  }
}
