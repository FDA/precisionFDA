import { EntityType } from '../../entity'

export const spaceReportPartSourceTypes = ['file', 'app', 'job', 'asset', 'workflow'] satisfies EntityType[]
export type SpaceReportPartSourceType = typeof spaceReportPartSourceTypes[number]
