# Material Motion for JavaScript #

[![Build Status](https://img.shields.io/circleci/project/github/material-motion/material-motion-js/develop.svg)](https://circleci.com/gh/material-motion/material-motion-js/)
[![codecov](https://codecov.io/gh/material-motion/material-motion-js/branch/develop/graph/badge.svg)](https://codecov.io/gh/material-motion/material-motion-js)

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

Want to contribute?  Awesome - thanks for helping!

To get started, just run these commands:

```
git clone git@github.com:material-motion/material-motion-js.git
cd material-motion-js
yarn run bootstrap
```

They will check out the repo, install the dependencies for each package, and link the packages to one another.  Then, find the package you want to work on in `packages` and start coding!

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
