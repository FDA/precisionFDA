import { Entity, Ref, OneToOne, Property, Reference } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { ExpertQuestion } from '../expert-question'

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
