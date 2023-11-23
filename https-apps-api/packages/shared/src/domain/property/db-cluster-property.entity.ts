import {
    Entity,
    Ref,
    ManyToOne,
} from '@mikro-orm/core'
import { GeneralProperty } from "./property.entity"
import { DbCluster } from "../db-cluster"

@Entity({ discriminatorValue: 'dbCluster' })
export class DbClusterProperty extends GeneralProperty {

    @ManyToOne(() => DbCluster, { joinColumn: 'target_id' })
    dbCluster: Ref<DbCluster>
}
