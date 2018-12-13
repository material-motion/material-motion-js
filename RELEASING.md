# Releasing #

To push a new build to NPM, follow these steps.  If the process changes, please update this doc. :smiley:

1.  Ensure that all local changes have been uploaded to GitHub.
2.  Verify that [continuous integration](https://circleci.com/gh/material-motion/material-motion-js) is passing.
3.  Check that there are no conflicting dependencies between packages.
    - The easiest way to do this is to run `yarn list`, scroll to the `material-motion` section, and verify that there are no bold dependencies in any of the `material-motion` packages.
4.  Build each package.  (`yarn run build` in the repo root.)
    1.  Verify there are no build/lint warnings.  If there are, fix them, and go back to step 1.
    2.  Smoke test `demos-react`.
        -   `yarn run serve` it, and ensure the interactions all work as expected.
    3.  Smoke test them in a separate project that uses Material Motion.
        1.  Generate a tarball preview of the package with `yarn pack`.
        2.  Replace the project's copy of the `material-motion` packages with the contents of the tarball(s).
        3.  Serve the project, and ensure the interactions still work as expected.
    4.  Verify that `material-motion.bundle.js` doesn't contain any `import` statements.
5.  Read each README, and ensure its information is current.
6.  Verify that each package's `.npmignore` is correct.
7.  Update the version number:
    -   `lerna version --no-push` will update `lerna.json` and the `package.json`s
    -   In each package's README, update the version in:
        -   the NPM badge, and
        -   the `<script>` tag example, if there is one.
8.  Update the CHANGELOG.
9.  Amend the commit created by `lerna version` to include the README and CHANGELOG changes.
10. Point the tag at the amended commit with `git tag vX.X.X --force`
11. `lerna publish` doesn't support 2FA yet, so `cd` into each `package` and run `yarn publish`
12. Upload the commit.
11. `yarn run deploy` in `demos-react`.  Check that http://material-motion-demos.firebaseapp.com still works correctly.
12. Delete the `material-motion` packages in the test project, and run `yarn` again to pull the published version from NPM.  Smoke test it again to validate that the deployed version works correctly.
13. Look at the published packages on [npmjs.com](https://www.npmjs.com/package/material-motion), and verify the versions and READMEs look correct.
14. Update the `stable` branch:
    ```
    git checkout stable
    git merge develop --ff-only
    git push origin stable
    ```
