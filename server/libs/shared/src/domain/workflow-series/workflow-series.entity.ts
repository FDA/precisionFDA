import {
    Collection,
    Entity,
    Ref,
    ManyToOne, OneToMany,
    PrimaryKey,
    Property,
    Reference,
} from '@mikro-orm/core'
import { User } from '../user'
import { BaseEntity } from '../../database/base-entity'
import { WorkflowSeriesProperty } from "../property";

@Entity({ tableName: 'workflow_series' })
export class WorkflowSeries extends BaseEntity {
    @PrimaryKey()
    id: number

    @Property()
    dxid: string

    @Property()
    name: string

    @Property()
    latestRevisionWorkflowId: number

    @Property()
    scope: string

    @Property()
    featured: boolean

    @Property()
    deleted: boolean

    @ManyToOne({ entity: () => User, serializedName: 'userId' })
    user!: Ref<User>

    @OneToMany({
        entity: () => WorkflowSeriesProperty,
        mappedBy: 'workflowSeries',
        orphanRemoval: true,
    })
    properties = new Collection<WorkflowSeriesProperty>(this);

    constructor(user: User) {
        super()
        this.user = Reference.create(user)
    }
}
