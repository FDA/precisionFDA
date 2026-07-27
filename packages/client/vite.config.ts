import fs from 'fs'
import path from 'path'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const isTest = mode === 'test'
  const enableSourceInspector = command === 'serve' && !isTest
  const fontAssetPattern = /\.(woff2?|ttf|otf|eot)$/i

  // Check if certs exist for HTTPS (dev server only)
  const keyPath = path.resolve(__dirname, '../../key.pem')
  const certPath = path.resolve(__dirname, '../../cert.pem')
  const hasHttpsCerts = fs.existsSync(keyPath) && fs.existsSync(certPath)

  const devOnlyPlugins = isProduction || isTest
    ? []
    : [
        babel({
          plugins: [
            [
              'babel-plugin-styled-components',
              {
                displayName: true,
                ssr: false,
              },
            ],
          ],
        }),
      ]

  return {
    // Base path: defaults to '/'. Set VITE_BASE_PATH='/packs/' when building for Rails.
    base: env.VITE_BASE_PATH || '/',

    resolve: {
      tsconfigPaths: true,
    },

    plugins: [
      devtools({
        injectSource: {
          enabled: enableSourceInspector,
        },
      }),
      ...devOnlyPlugins,
      react(),
      tailwindcss(),
    ],

    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]--[hash:base64:5]',
      },
    },

    build: {
      target: 'es2022',
      assetsInlineLimit: filePath => (fontAssetPattern.test(filePath) ? false : undefined),
      outDir: env.VITE_OUT_DIR || 'dist',
      assetsDir: 'static',
      emptyOutDir: true,
      manifest: true,
      sourcemap: !isProduction,
      rolldownOptions: {
        // Temporary adding input for transitioning to hosting through nginx.
        ...(env.VITE_BASE_PATH && {
          input: path.resolve(__dirname, 'src/index.tsx'),
        }),
        output: {
          format: 'es',
          entryFileNames: 'bundle-[hash].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: assetInfo => {
            // names is always a single-element array here
            if (assetInfo.names[0]?.endsWith('.css')) {
              return '[name]-[hash][extname]'
            }
            return '[name][extname]'
          },
          codeSplitting: {
            minSize: 10_000,
            groups: [
              {
                name: 'vendor-react',
                test: /node_modules[\\/](react|react-dom|react-router)([\\/]|$)/,
                priority: 50,
              },
              {
                name: 'vendor-tanstack',
                test: /node_modules[\\/]@tanstack[\\/]/,
                priority: 40,
              },
              {
                name: 'vendor-forms',
                test: /node_modules[\\/](react-hook-form|yup|@hookform)([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-styled',
                test: /node_modules[\\/]styled-components([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-axios',
                test: /node_modules[\\/]axios([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-select',
                test: /node_modules[\\/]react-select([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-charts',
                test: /node_modules[\\/]recharts([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-dnd',
                test: /node_modules[\\/]@dnd-kit[\\/]/,
                priority: 30,
              },
              {
                name: 'vendor-fp',
                test: /node_modules[\\/](lodash|ramda|effect|immer|use-immer)([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-date',
                test: /node_modules[\\/](date-fns|@date-fns)([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-icons',
                test: /node_modules[\\/]lucide-react([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-ui',
                test: /node_modules[\\/](@base-ui|clsx|tailwind-merge|class-variance-authority|dompurify|react-toastify|react-tooltip|react-modal|react-transition-group)([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-prettier',
                test: /node_modules[\\/]prettier([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-lexical',
                test: /node_modules[\\/](@lexical|lexical)([\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-markdown',
                test: /node_modules[\\/](react-markdown|rehype-.*|remark-.*|unified|hast-.*|mdast-.*|micromark.*|vfile|unist-.*)([\\/]|$)/,
                priority: 30,
              },
              {
                // Large (~635 kB) and rarely changing: splitting CodeMirror out of
                // app-components keeps it cached across app-code deploys.
                name: 'vendor-codemirror',
                test: /node_modules[\\/](@codemirror[\\/]|@uiw[\\/](react-codemirror|codemirror-extensions-basic-setup)|codemirror[\\/])/,
                priority: 30,
              },

              // ── App source groups ────────────────────────────────
              {
                name: 'app-icons',
                test: /src[\\/]components[\\/]icons[\\/]/,
                priority: 25,
              },
              // Shared components (excluding icons and Markdown, handled separately)
              {
                name: 'app-components',
                test: /src[\\/]components[\\/](?!icons[\\/]|Markdown[\\/])/,
                priority: 22,
              },
              // Shared utils, hooks, services, constants
              {
                name: 'app-utilities',
                test: /src[\\/](utils|hooks|services|constants)[\\/]/,
                priority: 20,
              },
              // Feature API files — three patterns, all excluding admin (which stays in app-admin):
              //   1. dot-prefixed: *.api.ts / *.types.ts  (e.g. apps.api.ts, spaces.types.ts)
              //   2. plain api.ts:  features/*/api.ts     (e.g. challenges/api.ts)
              //   3. query hooks:   use*Query.ts           (e.g. useFetchAppQuery.ts)
              {
                name: 'app-api-layer',
                test: /src[\\/]features[\\/](?!admin[\\/]).+\.(api|types)\.(ts|tsx)$|src[\\/]features[\\/](?!admin[\\/]).*[\\/]api\.(ts|tsx)$|src[\\/]features[\\/](?!admin[\\/]).+use\w+Query\.(ts|tsx)$/,
                priority: 18,
              },
              // Admin-only features — never loaded by regular users
              {
                name: 'app-admin',
                test: /src[\\/]features[\\/]admin[\\/]/,
                priority: 15,
              },
              // Lexical rich text editor — large feature, lazy-loaded
              {
                name: 'app-lexi',
                test: /src[\\/]features[\\/]lexi[\\/]/,
                priority: 15,
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
      proxy: (() => {
        const toRails = { target: 'https://localhost:3000', secure: false, changeOrigin: true }
        const routes = [
          // Auth / session
          '/login', '/logout', '/return_from_login',
          // Rails-rendered pages still served by Rails
          '/docs', '/pdfs', '/assets', '/guidelines', '/profile',
          '/users', '/licenses', '/notes', '/comparisons',
          '/discussions', '/apps', '/workflows/new', '/experts/new',
          // Admin pages (Rails-rendered)
          '/admin/comparator_settings', '/admin/org_action_requests',
          '/admin/participants', '/admin/admin_memberships', '/admin/activity_reports',
          // API
          '/api',
          // Regex routes (Rails edit forms)
          '^/workflows/.+/edit$', '^/experts/.+/edit$',
          // Challenge submissions (Rails legacy pages)
          '^/challenges/[^/]+/submissions/create$',
          '^/challenges/[^/]+/submissions/new$',
          '^/challenges/[^/]+/submissions/[^/]+/edit$',
        ]
        return Object.fromEntries(routes.map(r => [r, toRails]))
      })(),
    },

    publicDir: 'public',
  }
})
