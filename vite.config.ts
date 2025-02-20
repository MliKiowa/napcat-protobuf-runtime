import nodeResolve from '@rollup/plugin-node-resolve';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import cp from 'vite-plugin-cp';
import { builtinModules } from 'node:module';
const external = ['@protobuf-ts/runtime'];

const nodeModules = [...builtinModules, builtinModules.map(m => `node:${m}`)].flat();

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: './src/protobuf.ts',
            name: 'protobuf',
            formats: ['es', 'cjs'],
            fileName: 'protobuf',
        },
        rollupOptions: {
            external: [...nodeModules, ...external]
        }
    },
    plugins: [
        nodeResolve(),
        dts({ rollupTypes: true }),
        cp({
            targets: [
                { src: './src/package.json', dest: 'dist' },
                { src: './src/protobuf.ts', dest: 'dist/src' },
                { src: './src/test.ts', dest: 'dist/src' },
            ]
        })],
});