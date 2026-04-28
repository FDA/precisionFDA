import fs from 'fs'
import path from 'path'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { inspectorServer } from '@react-dev-inspector/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const fontAssetPattern = /\.(woff2?|ttf|otf|eot)$/i

  // Check if certs exist for HTTPS (dev server only)
  const keyPath = path.resolve(__dirname, '../../key.pem')
  const certPath = path.resolve(__dirname, '../../cert.pem')
  const hasHttpsCerts = fs.existsSync(keyPath) && fs.existsSync(certPath)

  const devOnlyPlugins = isProduction
    ? []
    : [
        inspectorServer(),
        babel({
          plugins: [
            [
              'babel-plugin-styled-components',
              {
                displayName: true,
                ssr: false,
              },
            ],
            '@react-dev-inspector/babel-plugin',
          ],
        }),
      ]

  return {
    // Base path for rails production - chunks will be loaded from /packs/
    base: isProduction ? '/packs/' : '/',

    resolve: {
      tsconfigPaths: true,
    },

    plugins: [
      react(),
      ...devOnlyPlugins,
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/monaco-editor/min/vs',
            dest: 'monaco-editor/min',
            rename: { stripBase: 3 },
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
      assetsInlineLimit: filePath => (fontAssetPattern.test(filePath) ? false : undefined),
      outDir: env.VITE_OUT_DIR || (isProduction ? '../rails/public/packs' : 'dist'),
      emptyOutDir: true,
      manifest: true,
      sourcemap: !isProduction,
      rolldownOptions: {
        input: path.resolve(__dirname, 'src/index.tsx'),
        output: {
          format: 'es',
          entryFileNames: 'bundle-[hash].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: assetInfo => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'bundle-[hash].css'
            }
            return '[name][extname]'
          },
          codeSplitting: {
            groups: [
              {
                name: 'vendor',
                test: /node_modules[\\/](react|react-dom|react-router|react-dev-inspector)([\\/]|$)/,
              },
            ],
          },
        },
      },
    },

    server: {
      host: 'localhost',
      port: 4000,
      https: hasHttpsCerts
        ? {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        }
        : undefined,
      proxy: {
        '/docs': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/logout': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/return_from_login': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/login': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/api': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/pdfs': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/assets': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/discussions': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/apps': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/workflows/new': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/notes': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/comparisons': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/licenses': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/users': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/profile': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/guidelines': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '^/workflows/.+/edit$': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '^/experts/.+/edit$': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/experts/new': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/admin/comparator_settings': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/admin/org_action_requests': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/admin/participants': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/admin/admin_memberships': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
        '/admin/activity_reports': {
          target: 'https://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
      },
    },

    publicDir: 'public',
  }
})
