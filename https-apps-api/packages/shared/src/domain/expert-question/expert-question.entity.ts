import { Entity, Enum, IdentifiedReference, ManyToOne, OneToOne, Property, Reference } from "@mikro-orm/core";
import { BaseEntity } from '../../database/base-entity'
import { ExpertAnswer } from "../expert-answer";
import { Expert } from "../expert/expert.entity";
import { User } from "../user";

export enum ExpertQuestionState {
  OPEN = 'open',
  ANSWERED = 'answered',
  IGNORED = 'ignored',
}

interface QuestionMeta {
  _original: string;
  // TODO(samuel) add proper type
  _edited: any;
}

@Entity({ tableName: 'expert_questions' })
export class ExpertQuestion extends BaseEntity {

  @ManyToOne({ entity: () => User })
  user: User

  @ManyToOne({ entity: () => Expert })
  expert: Expert

  @OneToOne({ inversedBy: 'question', orphanRemoval: true, entity: () => ExpertAnswer })
  answer: IdentifiedReference<ExpertAnswer>

  @Property({type: 'text'})
  body!: string

  @Property({ type: 'text'})
  meta?: QuestionMeta 

  @Enum()
  state!: ExpertQuestionState 

  constructor(answer?: ExpertAnswer) {
    super()
    if (answer) {
      this.answer = Reference.create(answer)
    }
  }
}