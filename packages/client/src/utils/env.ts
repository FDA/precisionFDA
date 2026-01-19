/**
 * All environment variables are accessed through import.meta.env with VITE_ prefix.
 * 
 * Usage:
 *   import { env } from '@/utils/env'
 */

/**
 * Whether the app is running in development mode
 */
export const IS_DEV = import.meta.env.DEV

/**
 * Whether Mock Service Worker is enabled for development
 */
export const ENABLE_DEV_MSW = import.meta.env.VITE_ENABLE_DEV_MSW === 'true'

/**
 * Consolidated env object for convenient imports
 */
export const env = {
  IS_DEV,
  ENABLE_DEV_MSW,
} as const
