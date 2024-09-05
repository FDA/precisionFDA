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
  'note',
  'dbcluster',
] as const

export type EntityType = (typeof entityTypes)[number]
