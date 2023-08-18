import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
    input: './src/index.ts',
    output: [
        {
            file: 'dist/axpager.umd.js',
            format: 'umd',
            name: 'axpager'
        }, {
            file: 'dist/axpager.umd.min.js',
            format: 'umd',
            name: 'axpager',
            sourcemap: true,
            plugins: [terser()]
        }
    ],
    plugins: [
        typescript(),
        commonjs()
    ]
}