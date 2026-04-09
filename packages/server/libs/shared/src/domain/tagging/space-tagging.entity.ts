import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Space } from '@shared/domain/space/space.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'

@Entity({ discriminatorValue: TAGGABLE_TYPE.SPACE })
export class SpaceTagging extends Tagging {
  @ManyToOne(() => Space, { joinColumn: 'taggable_id' })
  space: Ref<Space>
}
