import {
    Entity,
    Ref,
    ManyToOne,
} from '@mikro-orm/core'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { GeneralProperty } from '@shared/domain/property/property.entity'

@Entity({ discriminatorValue: 'dbCluster' })
export class DbClusterProperty extends GeneralProperty {

    @ManyToOne(() => DbCluster, { joinColumn: 'target_id' })
    dbCluster: Ref<DbCluster>
}
