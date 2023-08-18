import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
    input: './src/index.ts',
    output: [
        {
            file: 'dist/xpager.umd.js',
            format: 'umd',
            name: 'xpager'
        }, {
            file: 'dist/xpager.umd.min.js',
            format: 'umd',
            name: 'xpager',
            sourcemap: true,
            plugins: [terser()]
        }
    ],
    plugins: [
        typescript(),
        commonjs()
    ]
}