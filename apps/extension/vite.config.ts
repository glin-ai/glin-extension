import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  mode: 'production',
  plugins: [
    react({
      jsxRuntime: 'classic',
      babel: {
        plugins: [],
        presets: [
          ['@babel/preset-react', { runtime: 'classic', development: false }]
        ]
      }
    }),
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        inject: resolve(__dirname, 'src/inject.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // inject.js must be standalone for page context injection
          if (chunkInfo.name === 'inject') {
            return '[name].js';
          }
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: (id) => {
          // Don't chunk inject.ts with anything else
          if (id.includes('inject.ts')) {
            return undefined;
          }
          // Group node_modules into chunks
          if (id.includes('node_modules')) {
            if (id.includes('polkadot')) return 'polkadot';
            return 'vendor';
          }
        },
      },
    },
    sourcemap: false,
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VITE_RPC_ENDPOINT': JSON.stringify(
      process.env.VITE_RPC_ENDPOINT || 'ws://localhost:9944'
    ),
    'process.env.VITE_BACKEND_URL': JSON.stringify(
      process.env.VITE_BACKEND_URL || 'http://localhost:8080'
    ),
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
