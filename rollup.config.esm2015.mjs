import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: './src/index.ts',
    output: [
        {
            file: 'dist/esm2015/axpager.mjs',
            format: 'esm',
            name: 'axpager',
            sourcemap: true,
        }
    ],
    plugins: [
        typescript({tsconfig: 'tsconfig.es2015.json'}),
        commonjs()
    ]
}