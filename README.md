# Material Motion for JavaScript #

This is an experimental implementation of the concepts outlined in the [Material
Motion Starmap](https://material-motion.gitbooks.io/material-motion-starmap/content/).

### High-level Goals ###

- To enable the motions and gestures [proposed in the Material
  Spec](https://material.google.com/motion/material-motion.html) to be easily
  implemented by application authors in the JS ecosystem.

- To make prototyping new animated experiences simpler.

- To allow authors to write views in terms of URLs, and have the system guide
  the transitions between them.

- To yield a system that feels robust by default.  Fragile transitions erode
  user trust in the overall system: “should I enter my password in a glitchy
  app?”

## Usage ##

Material Motion needs some
[Performers](https://material-motion.gitbooks.io/material-motion-starmap/content/specifications/runtime/performer.html)
to do the actual animating.  You can install the default set by adding this line
to the imports in your primary JavaScript file:

```javascript
import * as MaterialMotion from "material-motion-experiments";
```

## Setup ##

As with any modern JavaScript library, you can install the dependencies using
`npm install`.  To see our [examples](https://material-motion.appspot.com/)
locally, you should also have [AppEngine
SDK](https://cloud.google.com/appengine/downloads) installed and on your `PATH`.

## Development ##

- `npm start`: Starts the AppEngine and Webpack dev servers, with Hot Module
  Replacement enabled.
- `npm run test`: Runs [Flow](https://flowtype.org/) type checker and
  [ESLint](http://eslint.org/).  Unit tests coming eventually.
- `npm run build`: Bundles `src` and `examples` in `dist` and `site`,
  respectively.
- `npm run clean`: Removes JavaScript bundles from `dist` and `site`.
- `npm run deploy-site`: Updates the [demo
  site](https://material-motion.appspot.com/).

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
