export const entityTypes = [
  'user',
  'job',
  'asset',
  'comparison',
  'file',
  'folder',
  'app',
  'workflow',
  'discussion',
  'resource',
] as const

export type EntityType = (typeof entityTypes)[number]
