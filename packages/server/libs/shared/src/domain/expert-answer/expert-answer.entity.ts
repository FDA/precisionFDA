import { Entity, Ref, OneToOne, Property, Reference } from '@mikro-orm/core'
import { ExpertQuestion } from '@shared/domain/expert-question/expert-question.entity'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'expert_answers' })
export class ExpertAnswer extends BaseEntity {

  @OneToOne({ mappedBy: 'answer', entity: () => ExpertQuestion })
  question: Ref<ExpertQuestion>

  @Property({ type: 'text' })
  body?: string

  @Property({ type: 'varchar' })
  state?: string

  constructor(question: ExpertQuestion) {
    super()
    this.question = Reference.create(question)
  }
}
