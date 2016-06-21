# Material Motion for JavaScript #

This is an experimental implementation of the concepts outlined in the [Material
Motion Starmap](https://material-motion.gitbooks.io/material-motion-starmap/content/).

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
