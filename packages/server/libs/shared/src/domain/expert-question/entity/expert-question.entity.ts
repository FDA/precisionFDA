import {
  Cascade,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property,
  Ref,
} from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base.entity'
import { ExpertQuestionComment } from '@shared/domain/comment/expert-question-comment.entity'
import { ExpertQuestionRepository } from '@shared/domain/expert-question/repository/expert-question.repository'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { User } from '@shared/domain/user/user.entity'

export enum ExpertQuestionState {
  OPEN = 'open',
  ANSWERED = 'answered',
  IGNORED = 'ignored',
}

interface QuestionMeta {
  _original: string
  _edited: boolean
}

@Entity({ tableName: 'expert_questions', repository: () => ExpertQuestionRepository })
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
