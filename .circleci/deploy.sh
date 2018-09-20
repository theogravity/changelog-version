#!/bin/bash

if [[ "${CIRCLE_BRANCH}" == "master" ]]
then
  echo "Raising package version and updating CHANGELOG.md"

  sudo npm i @theo.gravity/version-bump@1.0.21 -g

  git config --global push.default simple
  git config --global user.email "theo@suteki.nu"
  git config --global user.name "CircleCI Publisher"

  # Stash any prior changes to prevent merge conflicts
  git stash

  # Make sure to get the latest master (if there were any prior commits)
  git pull origin master

  # Re-apply the stash
  git stash apply

  # Fails the build if any of the steps below fails
  set -e

  # Version bump package.json (package.json is committed by npm-version-git), stamp CHANGELOG.md
  yarn prepare-publish

  # Changelog is now stamped with the version / time info - add to git
  git add CHANGELOG.md
  git add package.json

  # Amend the version commit with a ci skip so when we push the commits from the CI
  # The CI does not end up recursively building it

  # This gets the last commit log message
  PKG_VERSION=`version-bump show-version`

  # Appending [skip ci] to the log message
  # Note: --amend does not trigger the pre-commit hooks
  git commit -m "${PKG_VERSION} [skip ci]"

  git tag v${PKG_VERSION}

  # Push the commits back to master and assign a versioned release tag
  # Had to add --force because the pull was getting rejected each time
  git push && git push origin "v${PKG_VERSION}"

  # Publish the package to npm
  echo "Publishing package"
  npm publish
else
  echo "Skipping - branch is not master"
fi
