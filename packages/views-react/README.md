# <img src="https://www.gstatic.com/images/branding/product/2x/motion_48dp.png" width="48" height="48" style="position: relative; top: 10px;" alt="logo" /> Material Motion: React adaptor #

React components that make it easy to add gestures to a React application with Material Motion.

![Current version:](https://img.shields.io/badge/v0.0.0:-222222.svg?logo=npm)
[![Test status](https://img.shields.io/circleci/project/github/material-motion/material-motion-js/stable.svg?logo=circleci&label=Tests)](https://circleci.com/gh/material-motion/material-motion-js/tree/stable)
[![Code coverage](https://img.shields.io/codecov/c/github/material-motion/material-motion-js/stable.svg?logo=codecov&logoColor=white&label=Coverage)](https://codecov.io/gh/material-motion/material-motion-js/branch/stable)<br />
![HEAD:](https://img.shields.io/badge/HEAD:-222222.svg?logo=github&logoColor=white)
[![Test status](https://img.shields.io/circleci/project/github/material-motion/material-motion-js/develop.svg?logo=circleci&label=Tests)](https://circleci.com/gh/material-motion/material-motion-js/tree/develop)
[![Code coverage](https://img.shields.io/codecov/c/github/material-motion/material-motion-js/develop.svg?logo=codecov&logoColor=white&label=Coverage)](https://codecov.io/gh/material-motion/material-motion-js/branch/develop)

[![Chat](https://img.shields.io/discord/198544450366996480.svg?label=Chat%20with%20us&logo=discord)](https://discord.gg/material-motion)

## Status: Abandoned ##

🚨 Material Motion has not been used in a production application at Google.  It is unstable and unsupported. 🚨

Material Motion is an experimental project to bring gestural interaction to the Web.

The React adaptor was originally written to aid in attaching streams to/from a tree of React components.  Since then, we've discovered [JSS](https://github.com/cssinjs/jss/), a framework-agnostic way to attach a stream of styles to a document's style sheet.  Because it interacts directly with the style system, it bypasses React rendering to minimize the amount of work done per-frame.  This makes JSS a more performant than [`material-motion-views-react`](http://npmjs.com/package/material-motion-views-react).

The Material Motion team recommends JSS.  This React adaptor is being published for archival purposes, but will not be maintained going forward.

## Usage ##

There are two components in this package, [`AttachStreams`](./src/components/AttachStreams.tsx) and [`TransformTarget`](./src/components/TransformTarget.tsx).

See [`TossableDemo`](https://github.com/material-motion/material-motion-js/blob/c50150004cd860c01953877eb02e597dca618a86/packages/demos-react/src/TossableDemo.tsx) for an example of how to use them.

## Installation ##

```
yarn add material-motion-views-react
```

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
