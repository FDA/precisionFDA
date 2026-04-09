import { Cascade, Collection, Entity, ManyToOne, OneToMany, OneToOne, Ref, Reference } from '@mikro-orm/core'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { Note } from '@shared/domain/note/note.entity'
import { DiscussionTagging } from '@shared/domain/tagging/discussion-tagging.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { DiscussionReply } from '../discussion-reply/discussion-reply.entity'

@Entity({ tableName: 'discussions', repository: () => DiscussionRepository })
export class Discussion extends BaseEntity {
  @OneToOne({ entity: () => Note, cascade: [Cascade.REMOVE] })
  note: Ref<Note>

  @ManyToOne(() => User)
  user: Ref<User>

  @OneToMany({
    entity: () => DiscussionReply,
    mappedBy: 'discussion',
    cascade: [Cascade.REMOVE],
  })
  replies = new Collection<DiscussionReply>(this)

  @OneToMany({
    entity: () => DiscussionFollow,
    mappedBy: dc => dc.followableId,
    cascade: [Cascade.REMOVE],
  })
  follows = new Collection<DiscussionFollow>(this)

  @OneToMany(
    () => DiscussionTagging,
    tagging => tagging.discussion,
    { orphanRemoval: true },
  )
  taggings = new Collection<Discussion>(this)

  constructor(note: Note, user: User) {
    super()
    this.note = Reference.create(note)
    this.user = Reference.create(user)
  }
}
