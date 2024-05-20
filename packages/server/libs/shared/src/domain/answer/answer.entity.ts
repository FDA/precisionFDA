import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Note } from '@shared/domain/note/note.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'answers' })
export class Answer extends BaseEntity {
  @PrimaryKey()
    id: number

  @OneToOne({ entity: () => Note, cascade: [Cascade.REMOVE] })
    note: Ref<Note>

  @ManyToOne({ entity: () => Discussion })
    discussion: Ref<Discussion>

  @ManyToOne({ entity: () => User })
    user: Ref<User>

  @OneToMany({ entity: () => AnswerComment, mappedBy: ac => ac.commentableId,
    cascade: [Cascade.REMOVE]})
    comments = new Collection<AnswerComment>(this)

  @Property({ hidden: false })
    createdAt = new Date()

  @Property({ onUpdate: () => new Date(), hidden: false })
    updatedAt = new Date()

  constructor(note: Note, discussion: Discussion, user: User) {
    super()
    this.note = Reference.create(note)
    this.discussion = Reference.create(discussion)
    this.user = Reference.create(user)
  }
}
