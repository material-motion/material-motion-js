# Material Motion Runtime for JavaScript #

## Declarative motion: motion as data

This library does not do much on its own.  What it does do, however, is enable the expression of motion as discrete units of data that can be introspected, composed, and sent over a wire.

This library encourages you to describe motion as data, or what we call _plans_.  Plans are committed to a _runtime_.  A runtime coordinates the creation of _performers_, objects responsible for translating plans into concrete execution.

## Usage ##

```javascript
import { Runtime } from 'material-motion-runtime';

const runtime = new Runtime();
const element = document.getElementById('some-element');

runtime.addPlan({
  plan: new ImaginarySpringPlan({
    propertyName: 'translateX',
    destination: 100,
  }),
  target: element,
});
```

See also the [Runtime specification](https://material-motion.github.io/material-motion/starmap/specifications/runtime/Runtime/) in [the Starmap](https://material-motion.github.io/material-motion/starmap/).

## API ##

To encourage code readability, we follow the named arguments pattern: each function takes a single object literal.  Internally, we destructure that object to read a function's arguments.

### `Runtime` ###

- `new Runtime()`
  - `isActive`
    - `true` if any of the known performers have indicated that they are active.
  - `addPlan({ plan, target })`
    - The runtime will find a performer to handle the given plan.  If there's already an instance of that performer operating on a target, it will be passed the plan.  If not, one will be created and then passed the plan.
  - `addActivityListener({ listener })`
    - The provided listener will be called each time `runtime.isActive` changes.  `isActive` will be passed to the listener.  It will not be called until `isActive` changes.
    - `listener({ isActive })`
  - `removeActivityListener({ listener })`
    - The provided listener will no longer be called when `isActive` changes.

## Installation ##

```
yarn add material-motion-runtime
```

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
