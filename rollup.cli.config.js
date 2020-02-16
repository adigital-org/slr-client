import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import packageJson from './package.json'


export default {
  input: './src/index.es6.cli.js',
  output: {
    file: `./cli/${packageJson.name}-cli.js`,
    format: 'cjs'
  },
  plugins: [
    commonjs(),
    json()
  ]
};
