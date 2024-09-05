import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  Ref,
  OneToMany,
  OneToOne,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { ExpertQuestion, ExpertQuestionState } from '../expert-question/expert-question.entity'
import { ExpertMeta } from './expert.serializer'
import { ExpertRepository } from './expert.repository'

export enum ExpertState {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum ExpertScope {
  PUBLIC = 'public',
}

@Entity({ tableName: 'experts', repository: () => ExpertRepository })
export class Expert extends BaseEntity {
  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date()

  @OneToOne({ entity: () => User, inversedBy: 'expert' })
  user: Ref<User>

  @OneToMany({ entity: () => ExpertQuestion, mappedBy: 'expert' })
  questions = new Collection<ExpertQuestion>(this)

  @Enum({ nullable: true })
  scope?: ExpertScope

  @Enum({ nullable: true })
  state?: ExpertState

  // TODO(samuel) refactor this type to string, and find proper solution to define 2 versions of the entity
  // 1st that corresponds to db
  // 2nd that is properly typed
  // Or alternatively migrate mysql schema to json column and fix in ruby as well :D
  @Property({ type: 'text' })
  meta?: ExpertMeta

  @Property({ type: 'varchar' })
  image?: string;

  [EntityRepositoryType]?: ExpertRepository

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  async getAnsweredQuestionsCount() {
    return (await this.questions.matching({ where: {
      state: ExpertQuestionState.ANSWERED,
    }})).length
  }

  async getIgnoredQuestionsCount() {
    return (await this.questions.matching({ where: {
      state: ExpertQuestionState.IGNORED,
    }})).length
  }

  async getOpenQuestionsCount() {
    return (await this.questions.matching({ where: {
      state: ExpertQuestionState.OPEN,
    }})).length
  }
}