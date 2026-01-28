import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

  // Check if certs exist for HTTPS (dev server only)
  const keyPath = path.resolve(__dirname, '../../key.pem')
  const certPath = path.resolve(__dirname, '../../cert.pem')
  const hasHttpsCerts = fs.existsSync(keyPath) && fs.existsSync(certPath)

  // Use /assets/ base for production or when VITE_BASE_PATH is set (e.g. Docker builds)
  const basePath = env.VITE_BASE_PATH || (isProduction ? '/assets/' : '/')

  return {
    // Base path for rails production - chunks will be loaded from /assets/
    base: basePath,

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    plugins: [
      react({
        babel: {
          plugins: [
            [
              'babel-plugin-styled-components',
              {
                displayName: true,
                ssr: false,
              },
            ],
          ],
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/monaco-editor/min/vs',
            dest: 'monaco-editor/min',
          },
        ],
      }),
      tailwindcss(),
    ],

    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]--[hash:base64:5]',
      },
    },

    build: {
      outDir: env.VITE_OUT_DIR || (isProduction ? '../rails/app/assets/packs' : 'dist'),
      emptyOutDir: true,
      sourcemap: !isProduction,
      rollupOptions: {
        input: path.resolve(__dirname, 'src/index.tsx'),
        output: {
          format: 'es',
          entryFileNames: 'bundle.js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: assetInfo => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'bundle.css'
            }
            return '[name][extname]'
          },
        },
      },
    },

    server: {
      host: '0.0.0.0',
      port: 4000,
      https: hasHttpsCerts
        ? {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
          }
        : undefined,
      proxy: {
        '/docs': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/logout': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/return_from_login': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/login': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/api': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/pdfs': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/assets': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/discussions': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/apps': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/workflows/new': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/notes': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/comparisons': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/licenses': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/users': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/profile': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        '/guidelines': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        // /workflows/*/edit
        '^/workflows/.+/edit$': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        // /experts/*/edit
        '^/experts/.+/edit$': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
        // /experts/new
        '/experts/new': {
          target: 'https://0.0.0.0:3000',
          secure: false,
          changeOrigin: true,
        },
      },
    },

    publicDir: 'public',
  }
})
