import { Entity, Ref, OneToOne, Property, Reference, ManyToOne } from '@mikro-orm/core'
import { ExpertQuestion } from '@shared/domain/expert-question/expert-question.entity'
import { BaseEntity } from '../../database/base.entity'
import { Expert } from '@shared/domain/expert/expert.entity'

@Entity({ tableName: 'expert_answers' })
export class ExpertAnswer extends BaseEntity {
  @OneToOne({
    fieldName: 'expert_question_id',
    entity: () => ExpertQuestion,
  })
  question!: Ref<ExpertQuestion>

  @ManyToOne({ entity: () => Expert })
  expert: Ref<Expert>

  @Property({ type: 'text' })
  body?: string

  @Property({ type: 'varchar' })
  state?: string

  constructor(question: ExpertQuestion) {
    super()
    this.question = Reference.create(question)
  }
}
