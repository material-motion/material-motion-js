import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';

// Rollup doesn't seem to resolve the export statement unless you use a relative
// path.
import {
  renameSymbolObservable,
  unifyLicenses,
} from '../../node_modules/indefinite-observable/rollupPlugins';

export default {
  input: './src/index.ts',
  output: {
    file: './dist/material-motion.bundle.js',
    format: 'esm',
  },
  plugins: [
    resolve({
      modulesOnly: true,
    }),
    typescript(),
    renameSymbolObservable(),
    unifyLicenses(),
  ],
};
