# <img src="https://www.gstatic.com/images/branding/product/2x/motion_48dp.png" width="48" height="48" alt="logo" /> Material Motion for JavaScript #

[![Current version:](https://img.shields.io/badge/v0.0.0:-222222.svg?logo=npm)](https://www.npmjs.com/package/material-motion/v/0.0.0)
[![Test status](https://img.shields.io/circleci/project/github/material-motion/material-motion-js/stable.svg?logo=circleci&label=Tests)](https://circleci.com/gh/material-motion/material-motion-js/1116)
[![Code coverage](https://img.shields.io/codecov/c/github/material-motion/material-motion-js/stable.svg?logo=codecov&logoColor=white&label=Coverage)](https://codecov.io/gh/material-motion/material-motion-js/tree/b383c74d7db80417ad79080d28c93042d7f62f3e/packages)<br />
[![HEAD:](https://img.shields.io/badge/HEAD:-222222.svg?logo=github&logoColor=white)](https://github.com/material-motion/material-motion-js)
[![Test status](https://img.shields.io/circleci/project/github/material-motion/material-motion-js/develop.svg?logo=circleci&label=Tests)](https://circleci.com/gh/material-motion/material-motion-js/tree/develop)
[![Code coverage](https://img.shields.io/codecov/c/github/material-motion/material-motion-js/develop.svg?logo=codecov&logoColor=white&label=Coverage)](https://codecov.io/gh/material-motion/material-motion-js/branch/develop)

[![Chat](https://img.shields.io/discord/198544450366996480.svg?label=Chat%20with%20us&logo=discord)](https://discord.gg/material-motion)

This repo houses the JavaScript implementation of Material Motion.  For more information about the project as a whole, check [the Starmap](https://material-motion.github.io/material-motion/starmap/).

## High-level Goals ##

- To make gestural interactions as easy to reuse across applications as UI components already are.

- To enable the motions and gestures [described in the Material Spec](https://material.google.com/motion/material-motion.html) to be easily implemented by application authors in the JS ecosystem.

- To make prototyping new animated experiences simpler.

- To yield a system that feels robust by default.  Fragile interactions erode user trust in the overall system: “should I enter my password in a glitchy app?”

- To allow interactions to be inspected and tweaked with visual tools.

- To allow interactions to be easily ported across platforms.

- To allow authors to write views in terms of URLs, and have the system guide the transitions between them.
  - _Note:_ This is an eventual goal.  In the near term, Material Motion is focused specifically on aiding the creation of reusable gestural interactions.

## Contributing ##

Want to contribute?  Awesome - thanks for helping!

To get started, just run these commands:

```
git clone git@github.com:material-motion/material-motion-js.git
cd material-motion-js
yarn
$( yarn bin )/lerna bootstrap
```

They will check out the repo, install the dependencies for each package, and link the packages to one another.  Then, find the package you want to work on in `packages` and start coding!

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
