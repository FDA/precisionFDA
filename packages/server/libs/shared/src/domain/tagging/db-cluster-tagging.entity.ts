import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'

@Entity({ discriminatorValue: TAGGABLE_TYPE.DB_CLUSTER })
export class DbClusterTagging extends Tagging {
  @ManyToOne(() => DbCluster, { joinColumn: 'taggable_id' })
  dbCluster: Ref<DbCluster>
}
