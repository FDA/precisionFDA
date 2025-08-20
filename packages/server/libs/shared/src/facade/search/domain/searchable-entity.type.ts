import { EntityType } from '@shared/domain/entity/domain/entity.type'

export const searchableEntities = [
  'challenge',
  'expert',
  'expertQuestion',
] as const satisfies EntityType[]

export type SearchableEntityType = (typeof searchableEntities)[number]
