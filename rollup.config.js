// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'index.js',
  output: {
    file: 'docs/index.bundle.js',
    format: 'esm',
  },
  plugins: [
    resolve(),
  ]
};
