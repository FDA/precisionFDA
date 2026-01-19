export type PfdaRuntimeEnv = {
  RECAPTCHA_SITE_KEY?: string
}

declare global {
  interface Window {
    __PFDA_RUNTIME_ENV__?: PfdaRuntimeEnv
  }
}

const RUNTIME_ENV_PATH = '/env/keys.json'

export const getRuntimeEnv = (): PfdaRuntimeEnv => {
  if (window.__PFDA_RUNTIME_ENV__ === undefined) {
    throw new Error('getRuntimeEnv() called before loadRuntimeEnv() was completed')
  }
  return window.__PFDA_RUNTIME_ENV__
}

export const loadRuntimeEnv = async (): Promise<PfdaRuntimeEnv> => {
  // Local dev (vite dev server) should keep using import.meta.env.
  if (import.meta.env.DEV) {
    window.__PFDA_RUNTIME_ENV__ = window.__PFDA_RUNTIME_ENV__ ?? {}
    return window.__PFDA_RUNTIME_ENV__
  }

  try {
    const response = await fetch(RUNTIME_ENV_PATH, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Failed to load runtime env: ${response.status}`)
    }

    const json = (await response.json()) as unknown
    
    const parsed = (typeof json === 'object' && json !== null ? json : {}) as PfdaRuntimeEnv
    window.__PFDA_RUNTIME_ENV__ = parsed
    return parsed
  } catch {
    console.error('Failed to load runtime env')
    window.__PFDA_RUNTIME_ENV__ = window.__PFDA_RUNTIME_ENV__ ?? {}
    return window.__PFDA_RUNTIME_ENV__
  }
}
