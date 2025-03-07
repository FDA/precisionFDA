import {
  Entity,
  Enum,
  Ref,
  ManyToOne,
  Property,
  OneToMany,
  Collection,
  Cascade,
} from '@mikro-orm/core'
import { Expert } from '@shared/domain/expert/expert.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { ExpertQuestionComment } from '@shared/domain/comment/expert-question-comment.entity'

export enum ExpertQuestionState {
  OPEN = 'open',
  ANSWERED = 'answered',
  IGNORED = 'ignored',
}

interface QuestionMeta {
  _original: string
  // TODO(samuel) add proper type
  _edited: any
}

@Entity({ tableName: 'expert_questions' })
export class ExpertQuestion extends BaseEntity {
  @ManyToOne({ entity: () => User })
  user: Ref<User>

  @ManyToOne({ entity: () => Expert })
  expert: Ref<Expert>

  @Property({ type: 'text' })
  body!: string

  @Property({ type: 'text' })
  meta?: QuestionMeta

  @Enum()
  state!: ExpertQuestionState

  @OneToMany({
    entity: () => ExpertQuestionComment,
    mappedBy: (dc) => dc.commentableId,
    cascade: [Cascade.REMOVE],
  })
  comments = new Collection<ExpertQuestionComment>(this)
}
