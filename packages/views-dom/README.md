# Material Motion: DOM adaptor #

Functions that help Material Motion work with the DOM

## Status: Experimental ##

🚨 Material Motion has not been used in a production application at Google.  It is unstable and unsupported. 🚨

Material Motion is an experimental project to bring gestural interaction to the Web.

It was originally split into many packages: [`material-motion`](http://npmjs.com/package/material-motion/) contained the core logic.  Adaptors were provided to integrate with spring libraries like [Wobble](https://github.com/skevy/wobble/) and [Rebound](https://github.com/facebook/rebound-js/), and for view rendering frameworks like React.  This was the adaptor to talk directly to the DOM.

In the intervening time, we've standardized on using [Wobble](https://github.com/skevy/wobble/) for springs and [JSS](https://github.com/cssinjs/jss/) for framework-agnostic integration with style sheets.

Therefore, this package is likely to be merged with [`material-motion`](http://npmjs.com/package/material-motion/) in a future release.

## Usage ##

This example also appears in the [`material-motion`](http://npmjs.com/package/material-motion/) README.

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

## Installation ##

```
yarn add material-motion-views-dom
```

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
