import { PlatformClient } from '@shared/platform-client'

export type PlatformClientFunctionKeyType = {
  // biome-ignore lint/suspicious/noExplicitAny: needed to match all method signatures regardless of parameter types
  [K in keyof PlatformClient]: PlatformClient[K] extends (...args: any[]) => any ? K : never
}[keyof PlatformClient]
