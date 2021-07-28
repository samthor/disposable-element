// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'demo/index.js',
  output: {
    file: 'docs/index.js',
    format: 'esm',
  },
  plugins: [
    resolve(),
  ]
};
