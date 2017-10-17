# Material Motion for JavaScript #

[![Build Status](https://img.shields.io/circleci/project/github/material-motion/material-motion-js/develop.svg)](https://circleci.com/gh/material-motion/material-motion-js/)
[![codecov](https://codecov.io/gh/material-motion/material-motion-js/branch/develop/graph/badge.svg)](https://codecov.io/gh/material-motion/material-motion-js)
[![Chat](https://img.shields.io/discord/198544450366996480.svg)](https://discord.gg/material-motion)

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

## Organization ##

This repo houses all the packages that comprise the Material Motion implementation for JavaScript.  They are available in [`packages`](https://github.com/material-motion/material-motion-js/tree/develop/packages/):

- [`core`](https://github.com/material-motion/material-motion-js/tree/develop/packages/core/) houses the core implementation of Material Motion; including [`MotionObservable`](https://github.com/material-motion/material-motion-js/blob/develop/packages/core/src/observables/MotionObservable.ts), and [`ReactiveProperty`](https://github.com/material-motion/material-motion-js/blob/develop/packages/core/src/properties/ReactiveProperty.ts).

- [`views-dom`](https://github.com/material-motion/material-motion-js/tree/develop/packages/views-dom/) houses the DOM-specific functions, like [`getPointerEventStreamsFromElement`](https://github.com/material-motion/material-motion-js/blob/develop/packages/views-dom/src/getPointerEventStreamsFromElement.ts) and [`combineStyleStreams`](https://github.com/material-motion/material-motion-js/blob/develop/packages/views-dom/src/combineStyleStreams.ts).

- [`views-react`](https://github.com/material-motion/material-motion-js/tree/develop/packages/views-react/) houses the components that make Motion easy to integrate with React: [`AttachStreams`](https://github.com/material-motion/material-motion-js/blob/develop/packages/views-react/src/components/AttachStreams.tsx) and [`TransformTarget`](https://github.com/material-motion/material-motion-js/blob/develop/packages/views-react/src/components/TransformTarget.tsx).

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
