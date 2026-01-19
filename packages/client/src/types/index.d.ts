/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_DEV_MSW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __PFDA_RUNTIME_ENV__?: {
    RECAPTCHA_SITE_KEY?: string
  }
}

declare module 'ContentTools'

type BooleanString = 'true' | 'false'
