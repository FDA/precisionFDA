import { EntityType } from '@shared/domain/entity/domain/entity.type'

export const spaceReportPartSourceTypes = ['file', 'app', 'job', 'asset', 'workflow'] satisfies EntityType[]
export type SpaceReportPartSourceType = typeof spaceReportPartSourceTypes[number]
