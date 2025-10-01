import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
    ],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'popup.html'),
                background: resolve(__dirname, 'src/background.ts'),
                content: resolve(__dirname, 'src/content.ts'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name].[hash].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
        minify: process.env.NODE_ENV === 'production',
        sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.VITE_RPC_ENDPOINT': JSON.stringify(process.env.VITE_RPC_ENDPOINT || 'wss://glin-rpc-production.up.railway.app'),
        'process.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL || 'http://localhost:8080'),
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
//# sourceMappingURL=vite.config.js.map