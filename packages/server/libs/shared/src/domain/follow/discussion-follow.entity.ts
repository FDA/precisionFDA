import { Follow } from '@shared/domain/follow/follow.entity'
import { Entity, ManyToOne, Ref, Reference } from '@mikro-orm/core'
import { Discussion } from '@shared/domain/discussion/discussion.entity'

@Entity({ discriminatorValue: 'Discussion' })
export class DiscussionFollow extends Follow {
  @ManyToOne({ entity: () => Discussion, fieldName: 'followable_id' })
  followableId: Ref<Discussion>

  constructor(discussion: Discussion) {
    super()
    this.followableId = Reference.create(discussion)
    this.followableType = 'Discussion'
  }
}
