import {
    Entity,
    PrimaryKey,
    Property
} from '@mikro-orm/core'

export type PropertyType = 'node' | 'asset' | 'workflowSeries' | 'appSeries' | 'job' | 'dbCluster'

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
