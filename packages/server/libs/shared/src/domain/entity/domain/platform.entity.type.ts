// Platform entities but not pFDA entities
export const platformEntityTypes = ['stage'] as const

export type PlatformEntityType = (typeof platformEntityTypes)[number]
