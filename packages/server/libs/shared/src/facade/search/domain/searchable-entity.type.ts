
export const searchableEntities: readonly ['challenge', 'expert', 'expertQuestion'] = [
  'challenge',
  'expert',
  'expertQuestion',
]

export type SearchableEntityType = (typeof searchableEntities)[number]
