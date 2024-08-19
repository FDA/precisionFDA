// Platform entities but not pFDA entities
export const platformEntityTypes = ['stage', 'org', 'project', 'applet'] as const

export type PlatformEntityType = (typeof platformEntityTypes)[number]
