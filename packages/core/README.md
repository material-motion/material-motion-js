<!-- Uses position: relative for vertical aligning on NPM, since vertical-align: middle doesn't actually center it there, and GitHub doesn't support styling images. -->
# <img src="https://www.gstatic.com/images/branding/product/2x/motion_48dp.png" width="48" height="48" style="position: relative; top: 10px;" alt="logo" /> Material Motion #

Material Motion is a library used by the Material Design team to prototype interactive experiences with gestures.

[![Current version:](https://img.shields.io/badge/v0.0.0:-222222.svg?logo=npm)](https://www.npmjs.com/package/material-motion)
[![Test status](https://img.shields.io/circleci/project/github/material-motion/material-motion-js/stable.svg?logo=circleci&label=Tests)](https://circleci.com/gh/material-motion/material-motion-js/tree/stable)
[![Code coverage](https://img.shields.io/codecov/c/github/material-motion/material-motion-js/stable.svg?logo=codecov&logoColor=white&label=Coverage)](https://codecov.io/gh/material-motion/material-motion-js/branch/stable)<br />
[![HEAD:](https://img.shields.io/badge/HEAD:-222222.svg?logo=github&logoColor=white)](https://github.com/material-motion/material-motion-js)
[![Test status](https://img.shields.io/circleci/project/github/material-motion/material-motion-js/develop.svg?logo=circleci&label=Tests)](https://circleci.com/gh/material-motion/material-motion-js/tree/develop)
[![Code coverage](https://img.shields.io/codecov/c/github/material-motion/material-motion-js/develop.svg?logo=codecov&logoColor=white&label=Coverage)](https://codecov.io/gh/material-motion/material-motion-js/branch/develop)

[![Chat](https://img.shields.io/discord/198544450366996480.svg?label=Chat%20with%20us&logo=discord)](https://discord.gg/material-motion)

## Status: Experimental ##

🚨 Material Motion has not been used in a production application at Google.  It is unstable and unsupported. 🚨

### Unexplored areas ###

- **bundle size**

  Material Motion has not been run through [Closure Compiler](https://github.com/google/closure-compiler).  No attempts have been made to minify its file size.

  [Operators](https://github.com/material-motion/material-motion-js/tree/develop/packages/core/src/operators) are presently implemented using the [mixin pattern](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/), which may not minify well.  We may migrate to a [pipeable architecture, like RxJS's](https://github.com/ReactiveX/rxjs/blob/master/doc/pipeable-operators.md), in a future version.

- **memory footprint**

  Interactions are implemented by composing streams of user input to emit styles like `transform` and `opacity`.  We have not yet explored when/how these streams should be freed for garbage collection.

### Other likely changes ###

- **modularization**

  Material Motion is split into packages:

  - `material-motion` is a pure JavaScript library with no dependencies on the DOM or opinions about how the view layer is implemented.
  - [`material-motion-views-dom`](https://github.com/material-motion/material-motion-js/tree/develop/packages/views-dom/) contains functions for working with the DOM, like `getPointerEventStreamsFromElement` and `combineStyleStreams`.

  The original idea was to vend different `views` adaptors for different frameworks (React, Angular, etc.), separate from the pure logic in the core library.  [`JSS`](https://github.com/cssinjs/jss/) does a good job binding observables to CSS in a framework-agnostic way; therefore, `views-dom` is likely to be folded into `material-motion` in a future version.

- **function signatures**

  Material Motion uses the named argument pattern to make it easier to evolve APIs without making breaking changes.  There is usually a positional shorthand.  For instance, these are equivalent:

  ```typescript
  openOffset$.addedBy({ value$: thresholdAmount$ })  // named argument

  openOffset$.addedBy(thresholdAmount$)              // positional shorthand

  openOffset$.addedBy({                              // named argument, with
    value$: thresholdAmount$,                        // an explicit value for
    onlyEmitWithUpstream: false,                     // an optional parameter
  })
  ```

  All arguments that accept stream values [are suffixed with `$`](https://medium.com/@benlesh/observables-and-finnish-notation-df8356ed1c9b).

  The Material Motion API is declarative.  Its operators accept literal values and other streams, but not functions.  This decision was made to ensure the API is portable across platforms, and to provide a foundation for visual tooling to be built on top of.

  We will continue to assess the impact of these patterns on both ergonomics and code size, and may make changes in the future accordingly.

## Usage ##

Material Motion is often used to implement the toss gesture: where the user drags an element, and when it's released, it springs to a resting position.  [`Tossable`](https://github.com/material-motion/material-motion-js/blob/develop/packages/core/src/interactions/Tossable.ts) observes the drag's velocity and passes it to the spring, preserving the user's momentum and making the interaction feel seamless.

Here's a simple example:

```javascript
// We use JSS to update the document's style sheet whenever Material Motion
// emits a new value.
import { create as createJSS } from 'jss';
import createDefaultJSSPreset from 'jss-preset-default';

import {
  Draggable,
  Point2DSpring,
  Tossable,
} from 'material-motion';

import {
  combineStyleStreams,
  getPointerEventStreamsFromElement,
} from 'material-motion-views-dom';

// We're presuming there's an element on the page called "ball" that we want to
// make tossable.
const ball = document.getElementById('ball');

// `Draggable` listens for events on the down, move, and up streams.  It
// calculates how far a pointer has been dragged, and emits the result on its
// `value$` stream.
const pointerEvents = getPointerEventStreamsFromElement(ball);
const draggable = new Draggable(pointerEvents);

// `Tossable` passes the velocity from `draggable` into the spring.  This
// ensures that when the user lets go, the item continues moving at the same
// speed it was while the user was in control.
const spring = new Point2DSpring();
const tossable = new Tossable({ draggable, spring });

// `Tossable` outputs `translate$` and `willChange$`.
//
// `combineStyleStreams` will combine these into a stream of
// `{ transform, willChange }`, to be passed to JSS.
const ballStyles$ = combineStyleStreams(tossable.styleStreams);

// Unfortunately, there's a bit of boilerplate to instantiate JSS.  Notice
// that the output of `tossable` has been given the name `ball` here.
const styleSheet = jss.createStyleSheet(
  {
    ball: ballStyles$,
  },
  {
    link: true,
  }
).attach();

// Now, we assign the class name that JSS generated to the element that we
// received the pointer events from:
ball.classList.add(styleSheet.classes.ball);
```

You can see this in action at https://material-motion-demos.firebaseapp.com/toss/.  The source code is in [`TossableDemo`](https://github.com/material-motion/material-motion-js/blob/develop/packages/demos-react/src/TossableDemo.tsx).

## Documentation ##

Material Motion was originally a cross-platform initiative that targeted Android, iOS, and the Web.  Although the other platforms are not currently in active development, you may find the documentation from the shared project helpful: https://material-motion.github.io/material-motion/documentation/

Unfortunately, there is not yet independent documentation for the JavaScript implementation.  Hopefully, there will be in there future.

## Installation ##

```
yarn add material-motion material-motion-views-dom
```

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
