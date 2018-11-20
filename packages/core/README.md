# Material Motion #

Material Motion is a library used by the Material Design team to prototype interactive experiences.

[![Build Status](https://img.shields.io/circleci/project/github/material-motion/material-motion-js/stable.svg)](https://circleci.com/gh/material-motion/material-motion-js/)
[![codecov](https://codecov.io/gh/material-motion/material-motion-js/branch/stable/graph/badge.svg)](https://codecov.io/gh/material-motion/material-motion-js)
[![Chat](https://img.shields.io/discord/198544450366996480.svg)](https://discord.gg/material-motion)

## Status: Experimental ##

🚨 Material Motion has not been used in a production application at Google.  It is unstable and unsupported. 🚨

### Unexplored areas ###

- **bundle size**

  Material Motion has not been run through Closure Compiler.  No attempts have been made to minify its file size.

  [Operators](https://github.com/material-motion/material-motion-js/tree/develop/packages/core/src/operators) are presently implemented using the [mixin pattern](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/), which is unlikedly to be well-understood by minifiers.  Therefore, they may be migrated to a [pipeable architecture, like RxJS's](https://github.com/ReactiveX/rxjs/blob/master/doc/pipeable-operators.md), in a future version.

- **memory footprint**

  Interactions are implemented by composing streams of user input to emit styles like `transform` and `opacity`.  We have not yet explored when/how these streams should be freed for garbage collection.

### Other likely changes ###

- **modularization**

  Material Motion is split into two packages:

  - `material-motion` is a pure JavaScript library with no dependencies on the DOM or opinions about how a view layer is implemented.
  - [`material-motion-views-dom`](https://github.com/material-motion/material-motion-js/tree/develop/packages/views-dom/)

  The original idea was to vend different `views` libraries for different frameworks (React, Angular, etc.), separate from the common logic in the core library.  [`jss`](https://github.com/cssinjs/jss/)

  Therefore `views-dom` is likely to be folded into `material-motion` in a future version.

- **function signatures**

## Usage ##

```javascript
import {  } from 'material-motion';
import {  } from 'material-motion-views-dom';


```

See also the [MotionProperty specification]() in [the Starmap](https://material-motion.github.io/material-motion/starmap/).

## API ##

To encourage code readability, we follow the named arguments pattern: each function takes a single object literal.  Internally, we destructure that object to read a function's arguments.

### `MotionProperty` ###

## Installation ##

```
yarn add material-motion material-motion-views-dom
```

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
