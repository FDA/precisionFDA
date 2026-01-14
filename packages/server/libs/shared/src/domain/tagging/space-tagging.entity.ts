import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { Space } from '@shared/domain/space/space.entity'

@Entity({ discriminatorValue: TAGGABLE_TYPE.SPACE })
export class SpaceTagging extends Tagging {
  @ManyToOne(() => Space, { joinColumn: 'taggable_id' })
  space: Ref<Space>
}
