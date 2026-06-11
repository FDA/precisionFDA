import { EntityType } from '@shared/domain/entity/domain/entity.type'

export const spaceReportPartSourceTypes: ('user' | 'job' | 'asset' | 'file' | 'app' | 'workflow' | 'discussion')[] = [
  'file',
  'app',
  'job',
  'asset',
  'workflow',
  'user',
  'discussion',
] satisfies EntityType[]
export type SpaceReportPartSourceType = (typeof spaceReportPartSourceTypes)[number]
