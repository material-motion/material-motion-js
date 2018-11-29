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
    2.  Smoke test them in a separate project that uses Material Motion.
        1.  Replace the project's copy of the `material-motion` packages with the built artifacts.
        2.  Serve the project, and ensure the interactions still work as expected.
5.  Read each README, and ensure its information is current.
6.  Verify that each package's `.npmignore` is correct.
7.  Update the version number:
    -   In `lerna.json`.
    -   In each package's README:
        -   In the NPM badge.
        -   In the `<script>` tag example, if there is one.
8.  Update the CHANGELOG.
9.  Commit the README and CHANGELOG updates as `[release] v#.#.#`, and upload the commit.
10. `lerna publish`
11. `yarn run deploy` in `demos-react`.  Check that http://material-motion-demos.firebaseapp.com still works correctly.
12. Delete the `material-motion` packages in the test project, and run `yarn` again to pull the published version from NPM.  Smoke test it again to validate that the deployed version works correctly.
13. Look at the published packages on [npmjs.com](https://www.npmjs.com/package/material-motion), and verify the versions and READMEs look correct.
14. Update the `stable` branch:
    ```
    git checkout stable
    git merge develop --ff-only
    git push origin stable
    ```
