# Contributing

Contributations are welcomed and encouraged!

Anyone that contributes useful code will be granted repo write and npm publish access.

(This is so there isn't one maintainer of the project and new feature requests are not blocked by a sole maintainer.)

## Prepping your pull request

- Your PR should contain unit tests for any additions / fixes. PRs with failing tests will not be accepted (with exceptions).
- Your code should pass linting (runs part of tests).
- Do *not* version bump `package.json`.
- Use `npm run prepare-log` to stamp the `CHANGELOG.md` file. Add your release comments below the stamp.
- Please leave your npm username in the PR comments if you have not already been granted access to publish.

You can now submit your PR.

## Once your pull request is approved

If this is your first time contributing (if you contributed code):

- You'll be given permission to merge your PR into master.
- You'll be given permission to publish to npm.

Once you have permissions:

- Do a squash merge on your PR and delete the branch (if applicable)
- Update your local repository against the latest master
- Run [`npm version`](https://docs.npmjs.com/cli/version) to version bump `package.json`
- Run `npm run release-log` to stamp the `CHANGELOG.md` file
- Commit and push the changed `package.json` and `CHANGELOG.md` file
- Run `npm publish` to publish the new package
