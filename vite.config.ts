import { UserConfig, defineConfig } from 'vite';
import { PluginOption } from 'vite';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';
import dts from 'vite-plugin-dts'
import cp from 'vite-plugin-cp';

const external = ['@protobuf-ts/runtime'];
const nodeModules = [...builtinModules, builtinModules.map(m => `node:${m}`)].flat();

const baseConfigPlugin: PluginOption[] = [nodeResolve(), dts({ rollupTypes: true }), cp({
    targets: [
        { src: './src/package.json', dest: 'dist' },
        { src: './src/protobuf.ts', dest: 'dist/src' },
        { src: './src/test.ts', dest: 'dist/src' },
    ]
})];
const baseConfig = (mode: string = 'development') => defineConfig({
    resolve: {
        conditions: ['node', 'default'],
    },
    build: {
        sourcemap: true,
        target: 'esnext',
        minify: false,
        lib: {
            entry: 'src/protobuf.ts',
            formats: ['es', 'cjs'],
            fileName: (format) => { return format === 'es' ? 'protobuf.mjs' : 'protobuf.cjs'; },
        },
        rollupOptions: {
            external: [...nodeModules, ...external]
        },
    },
});
export default defineConfig(({ mode }): UserConfig => {
    return {
        ...baseConfig(mode), plugins: [
            ...baseConfigPlugin]
    };
});