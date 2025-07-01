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
  Cascade,
} from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { ExpertQuestion, ExpertQuestionState } from '../expert-question/expert-question.entity'
import { ExpertRepository } from './expert.repository'
import { ExpertAnswer } from '@shared/domain/expert-answer/expert-answer.entity'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { WorkaroundJsonType } from '@shared/database/json-workaround.type'

export enum EXPERT_STATE {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface ExpertMeta {
  _prefname: string
  _about: string
  _blog: string
  _blog_title: string
  _challenge: string
  _image_id: string
}

@Entity({ tableName: 'experts', repository: () => ExpertRepository })
export class Expert extends ScopedEntity {
  @OneToOne({ entity: () => User, inversedBy: 'expert' })
  user: Ref<User>

  @OneToMany(() => ExpertQuestion, (question) => question.expert, {
    cascade: [Cascade.REMOVE],
  })
  questions = new Collection<ExpertQuestion>(this)

  @OneToMany(() => ExpertAnswer, (answer) => answer.expert, {
    cascade: [Cascade.REMOVE],
  })
  answers = new Collection<ExpertAnswer>(this)

  @Enum()
  state: EXPERT_STATE

  @Property({ type: WorkaroundJsonType })
  meta?: ExpertMeta

  @Property({ type: 'varchar' })
  image?: string;

  [EntityRepositoryType]?: ExpertRepository

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  async getAnsweredQuestionsCount(): Promise<number> {
    return (
      await this.questions.matching({
        where: {
          state: ExpertQuestionState.ANSWERED,
        },
      })
    ).length
  }

  async getIgnoredQuestionsCount(): Promise<number> {
    return (
      await this.questions.matching({
        where: {
          state: ExpertQuestionState.IGNORED,
        },
      })
    ).length
  }

  async getOpenQuestionsCount(): Promise<number> {
    return (
      await this.questions.matching({
        where: {
          state: ExpertQuestionState.OPEN,
        },
      })
    ).length
  }

  async isAccessibleBy(user?: User): Promise<boolean> {
    if (!user || !(await user.isSiteAdmin())) {
      return this.isPublic()
    }

    return await this.isEditableBy(user)
  }

  async isEditableBy(user: User): Promise<boolean> {
    if (await user.isSiteAdmin()) {
      return true
    }

    return this.user.id === user.id
  }
}
