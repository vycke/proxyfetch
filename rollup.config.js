import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.js',
    output: {
      dir: 'dist/esm',
      format: 'esm',
    },
    plugins: [nodeResolve(), terser()],
  },
  {
    input: 'src/index.js',
    output: {
      dir: 'dist',
      format: 'cjs',
    },
    plugins: [nodeResolve(), terser()],
  },
];
