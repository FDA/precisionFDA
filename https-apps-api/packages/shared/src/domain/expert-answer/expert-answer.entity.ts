import { Entity, IdentifiedReference, OneToOne, Property, Reference } from "@mikro-orm/core";
import { BaseEntity } from '../../database/base-entity'
import { ExpertQuestion } from "../expert-question/expert-question.entity";

@Entity({ tableName: 'expert_answers' })
export class ExpertAnswer extends BaseEntity {

  @OneToOne({ mappedBy: 'answer', entity: () => ExpertQuestion })
  question: IdentifiedReference<ExpertQuestion>

  @Property({type: 'text'})
  body?: string

  @Property({ type: 'varchar' })
  state?: string

  constructor(question: ExpertQuestion) {
    super()
    this.question = Reference.create(question);
  }
}
