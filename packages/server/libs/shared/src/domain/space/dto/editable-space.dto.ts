import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'

export class EditableSpaceDTO {
  scope: string
  name: string
  type: string
  title: string
  protected: boolean
  restrictedReviewer: boolean
  createdAt: Date

  static fromEntity(space: Space): EditableSpaceDTO {
    return {
      scope: space.scope,
      name: space.name,
      type: SPACE_TYPE[space.type].toLowerCase(),
      title: space.title,
      protected: space.protected ?? false,
      restrictedReviewer: space.meta?.restricted_reviewer === true,
      createdAt: space.createdAt,
    }
  }
}
