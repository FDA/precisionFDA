import { Entity, ManyToOne, OneToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base.entity'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { Expert } from '@shared/domain/expert/entity/expert.entity'

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
