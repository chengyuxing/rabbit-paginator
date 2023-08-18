import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: './src/index.ts',
    output: [
        {
            file: 'dist/xpager/esm2015/xpager.mjs',
            format: 'esm',
            name: 'xpager',
            sourcemap: true,
        }
    ],
    plugins: [
        typescript({tsconfig: 'tsconfig.es2015.json'}),
        commonjs()
    ]
}