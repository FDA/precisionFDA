import { Expert, EXPERT_STATE } from '@shared/domain/expert/entity/expert.entity'
import { EntityScope } from '@shared/types/common'

export class ExpertDTO {
  id: number
  name: string
  userId: number
  image: string
  state: EXPERT_STATE
  scope: EntityScope
  createdAt: Date
  updatedAt: Date
  meta: {
    title: string
    about: string
    blog: string
    blogTitle: string
    challenge: string
    imageId: string
  }

  static fromEntity(expert: Expert): ExpertDTO {
    return {
      id: expert.id,
      name: expert.user.getProperty('fullName'),
      userId: expert.user.id,
      state: expert.state,
      scope: expert.scope,
      createdAt: expert.createdAt,
      updatedAt: expert.updatedAt,
      image: expert.image, // todo: rename this stupid name (in db as well ideally), it's an URL !!!!!!
      meta: {
        title: expert.meta._prefname,
        about: expert.meta._about,
        blog: expert.meta._blog,
        blogTitle: expert.meta._blog_title,
        challenge: expert.meta._challenge,
        imageId: expert.meta._image_id,
      },
    }
  }
}
