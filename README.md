# Material Motion for JavaScript #

This repo houses the JavaScript implementation of Material Motion.  For more information about the project as a whole, check [the Starmap](https://material-motion.github.io/material-motion/starmap/).

## High-level Goals ##

- To enable the motions and gestures [described in the Material Spec](https://material.google.com/motion/material-motion.html) to be easily implemented by application authors in the JS ecosystem.

- To make prototyping new animated experiences simpler.

- To allow authors to write views in terms of URLs, and have the system guide the transitions between them.

- To yield a system that feels robust by default.  Fragile transitions erode user trust in the overall system: “should I enter my password in a glitchy app?”

## Organization ##

This repo houses all the packages that comprise the Material Motion implementation for JavaScript.  They are available in [`packages`](https://github.com/material-motion/material-motion-js/tree/develop/packages/):

- [`runtime`](https://github.com/material-motion/material-motion-experiments-js/tree/develop/packages/runtime/) houses the [Runtime](https://material-motion.github.io/material-motion/starmap/specifications/runtime/Runtime/).  It provides a centralized place for all motion to be registered, so work can be coordinated appropriately and displayed in tooling.

## Contributing ##

We use [lerna](https://lernajs.io/) to make it easier to work across packages.  Rather than running [`yarn`](https://yarnpkg.com/) (or `npm`) in the individual package folders, just use `lerna` from the root:

- `lerna bootstrap` will install each packages dependencies, linking across between appropriately when they depend on one another.  This is similar to running `yarn install` in each package.

- `lerna run test` will run the tests specified in each package's `package.json` file.

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
