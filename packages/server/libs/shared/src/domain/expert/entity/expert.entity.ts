import { Cascade, Collection, Entity, Enum, OneToMany, OneToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { WorkaroundJsonType } from '@shared/database/json-workaround.type'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { ExpertRepository } from '@shared/domain/expert/repository/expert.repository'
import { ExpertAnswer } from '@shared/domain/expert-answer/entity/expert-answer.entity'
import { ExpertQuestion, ExpertQuestionState } from '@shared/domain/expert-question/entity/expert-question.entity'
import { User } from '@shared/domain/user/user.entity'

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

  @OneToMany(
    () => ExpertQuestion,
    question => question.expert,
    {
      cascade: [Cascade.REMOVE],
    },
  )
  questions = new Collection<ExpertQuestion>(this)

  @OneToMany(
    () => ExpertAnswer,
    answer => answer.expert,
    {
      cascade: [Cascade.REMOVE],
    },
  )
  answers = new Collection<ExpertAnswer>(this)

  @Enum()
  state: EXPERT_STATE

  @Property({ type: WorkaroundJsonType })
  meta?: ExpertMeta

  @Property({ type: 'varchar' })
  image?: string

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
