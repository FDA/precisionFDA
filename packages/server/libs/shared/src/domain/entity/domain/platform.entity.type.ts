export const platformEntityTypes = ['stage'] as const

export type PlatformEntityType = (typeof platformEntityTypes)[number]
