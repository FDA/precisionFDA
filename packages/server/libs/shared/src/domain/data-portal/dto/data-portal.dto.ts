import { Logger } from '@nestjs/common'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { DataPortalMemberDTO } from '@shared/domain/data-portal/dto/data-portal-member.dto'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

export class DataPortalDTO {
  @ServiceLogger()
  private static readonly logger: Logger

  id: number
  name: string
  description: string
  urlSlug: string
  content?: string
  editorState?: string
  hostLeadDxuser: string
  guestLeadDxuser: string
  lastUpdated: string
  cardImageId: number
  cardImageUid: string
  cardImageUrl: string
  spaceId: number
  sortOrder: number
  default: boolean
  members?: DataPortalMemberDTO[]

  static fromEntity(portal: DataPortal, deepMapping?: boolean): DataPortalDTO {
    const dto = new DataPortalDTO()
    dto.id = portal.id
    dto.name = portal.name
    dto.urlSlug = portal.urlSlug
    dto.description = portal.description
    dto.sortOrder = portal.sortOrder
    dto.cardImageUid = portal.cardImage?.getEntity().uid
    dto.cardImageUrl = portal.cardImageUrl
    dto.spaceId = portal.space?.getEntity().id
    dto.lastUpdated = portal.updatedAt.toString()

    if (deepMapping) {
      dto.content = portal.content
      try {
        JSON.parse(portal.editorState)
        dto.editorState = portal.editorState
      } catch {
        this.logger.log('Invalid editorState JSON')
        dto.editorState = null
      }

      dto.members = portal.space.getEntity().spaceMemberships.getItems().map(DataPortalMemberDTO.fromEntity)
    }

    portal.space
      .getEntity()
      .spaceMemberships.getItems()
      .forEach(sm => {
        if (sm.isGuest() && sm.isLead()) {
          dto.guestLeadDxuser = sm.user.getEntity().dxuser
        }
        if (sm.isHost() && sm.isLead()) {
          dto.hostLeadDxuser = sm.user.getEntity().dxuser
        }
      })
    return dto
  }
}
