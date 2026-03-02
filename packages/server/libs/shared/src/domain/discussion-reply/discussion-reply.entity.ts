import { Cascade, Collection, Entity, ManyToOne, OneToMany, OneToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Note } from '@shared/domain/note/note.entity'
import { User } from '@shared/domain/user/user.entity'
import { DISCUSSION_REPLY_TYPE } from '../discussion-reply/discussion-reply.types'
import { DiscussionReplyRepository } from './discussion-reply.repository'

@Entity({
  abstract: true,
  tableName: 'discussion_replies',
  repository: () => DiscussionReplyRepository,
  discriminatorColumn: 'reply_type',
})
export class DiscussionReply extends BaseEntity {
  @OneToOne({ entity: () => Note, cascade: [Cascade.REMOVE] })
  note: Ref<Note>

  @ManyToOne({ entity: () => Discussion })
  discussion: Ref<Discussion>

  @ManyToOne({ entity: () => User })
  user: Ref<User>

  @Property()
  replyType: DISCUSSION_REPLY_TYPE

  @ManyToOne({ entity: () => DiscussionReply, nullable: true })
  parent: Ref<DiscussionReply>

  @OneToMany({
    entity: () => DiscussionReply,
    mappedBy: 'parent',
    cascade: [Cascade.REMOVE],
  })
  comments = new Collection<DiscussionReply>(this)

  constructor(note: Note, discussion: Discussion, user: User, parent?: DiscussionReply) {
    super()
    this.note = Reference.create(note)
    this.discussion = Reference.create(discussion)
    this.user = Reference.create(user)
    this.parent = parent ? Reference.create(parent) : null
  }
}
