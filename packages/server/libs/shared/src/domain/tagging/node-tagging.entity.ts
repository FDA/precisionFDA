import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { Node } from '@shared/domain/user-file/node.entity'

@Entity({ discriminatorValue: TAGGABLE_TYPE.NODE })
export class NodeTagging extends Tagging {
  @ManyToOne(() => Node, { joinColumn: 'taggable_id' })
  node: Ref<Node>
}
