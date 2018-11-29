# Releasing #

To push a new build to NPM, follow these steps.  If the process changes, please update this doc. :smiley:

1.  Ensure that all local changes have been uploaded to GitHub.
2.  Verify that [continuous integration](https://circleci.com/gh/material-motion/material-motion-js) is passing.
3.  Build each package. (`yarn run build` in the repo root.)
    1.  Verify there are no build/lint warnings.  If there are, fix them, and go back to step 1.
    2.  Smoke test `demos-react`.
        -   `yarn run serve` it, and ensure the interactions all work as expected.
    2.  Smoke test them in a separate project that uses Material Motion.
        1.  Replace the project's copy of the `material-motion` packages with the built artifacts.
        2.  Serve the project, and ensure the interactions still work as expected.
3.  Read each README, and ensure its information is current.
4.  Verify that each package's `.npmignore` is correct.
5.  Update the version number:
    -   In `lerna.json`.
    -   In each package's README:
        -   In the NPM badge.
        -   In the `<script>` tag example, if there is one.
6.  Update the CHANGELOG.
7.  Commit the README and CHANGELOG updates as `[release] v#.#.#`, and upload the commit.
8. `lerna publish`
9.  `yarn run deploy` in `demos-react`.  Check that http://material-motion-demos.firebaseapp.com still works correctly.
10. Delete the `material-motion` packages in the test project and run `yarn` again to pull the published version from NPM.  Smoke test it again to validate that the deployed version works correctly.
11. Look at the published packages on [npmjs.com](https://www.npmjs.com/package/material-motion), and verify the versions and READMEs look correct.
12. Update the `stable` branch:
    ```
    git checkout stable
    git merge develop --ff
    git push origin stable
    ```
