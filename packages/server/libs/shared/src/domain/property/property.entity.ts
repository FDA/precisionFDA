import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

export const propertyTypes = [
  'node',
  'asset',
  'workflowSeries',
  'appSeries',
  'job',
  'dbCluster',
] as const
export type PropertyType = (typeof propertyTypes)[number]

@Entity({
  abstract: true,
  tableName: 'properties',
  discriminatorColumn: 'target_type',
})
// Named 'General' to avoid import conflict with mikro-orm.
export class GeneralProperty {
  @PrimaryKey()
  targetId: number

  @PrimaryKey()
  targetType: PropertyType

  @PrimaryKey()
  propertyName: string

  @Property()
  propertyValue: string
}
