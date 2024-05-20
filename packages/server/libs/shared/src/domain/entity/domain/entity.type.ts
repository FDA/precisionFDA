export const entityTypes = [
  'user',
  'job',
  'asset',
  'comparison',
  'file',
  'app',
  'workflow',
  'discussion',
  'resource',
] as const

export type EntityType = (typeof entityTypes)[number]
