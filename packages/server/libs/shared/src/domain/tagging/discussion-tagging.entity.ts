import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'

@Entity({ discriminatorValue: TAGGABLE_TYPE.DISCUSSION })
export class DiscussionTagging extends Tagging {
  @ManyToOne(() => Discussion, { joinColumn: 'taggable_id' })
  discussion: Ref<Discussion>
}
