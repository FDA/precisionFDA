import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { Answer } from '@shared/domain/answer/answer.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { Note } from '@shared/domain/note/note.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { DiscussionReply } from '../discussion-reply/discussion-reply.entity'

@Entity({ tableName: 'discussions', repository: () => DiscussionRepository })
export class Discussion extends BaseEntity {
  @OneToOne({ entity: () => Note, cascade: [Cascade.REMOVE] })
  note: Ref<Note>

  @ManyToOne(() => User)
  user: Ref<User>

  @OneToMany({ entity: () => DiscussionReply, mappedBy: 'discussion', cascade: [Cascade.REMOVE] })
  discussionReplies = new Collection<DiscussionReply>(this)

  @OneToMany({ entity: () => Answer, mappedBy: 'discussion', cascade: [Cascade.REMOVE] })
  answers = new Collection<Answer>(this)

  @OneToMany({
    entity: () => DiscussionComment,
    mappedBy: (dc) => dc.commentable,
    cascade: [Cascade.REMOVE],
  })
  comments = new Collection<DiscussionComment>(this)

  @OneToMany({
    entity: () => DiscussionFollow,
    mappedBy: (dc) => dc.followableId,
    cascade: [Cascade.REMOVE],
  })
  follows = new Collection<DiscussionFollow>(this)

  constructor(note: Note, user: User) {
    super()
    this.note = Reference.create(note)
    this.user = Reference.create(user)
  }
}
