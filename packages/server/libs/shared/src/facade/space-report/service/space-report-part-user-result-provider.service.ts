import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { spaceMembershipSideToNameMap } from '@shared/domain/space-membership/space-membership-side-to-name.map'
import { spaceMembershipTypeToNameMap } from '@shared/domain/space-membership/space-membership-type-to-name.map'
import {
  SpaceReportPartUserTileHtmlResult,
  SpaceReportPartUserTileJsonResult,
} from '@shared/domain/space-report/model/space-report-part-user-tile-result'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { User } from '@shared/domain/user/user.entity'
import { SpaceReportPartResultProvider } from './space-report-part-result.provider'

interface SpaceReportResultJsonUser
  extends Omit<SpaceReportPartUserTileHtmlResult, 'role' | 'side'> {
  role: string
  side?: string
}

@Injectable()
export class SpaceReportPartUserResultProvider extends SpaceReportPartResultProvider<'user'> {
  protected async getJsonResult(
    entity: User,
    space: Space,
  ): Promise<SpaceReportPartUserTileJsonResult> {
    const htmlResult = await this.getHtmlResult(entity, space)

    const result: SpaceReportResultJsonUser = {
      title: htmlResult.title,
      memberSince: htmlResult.memberSince,
      dxuser: htmlResult.dxuser,
      link: htmlResult.link,
      role: spaceMembershipTypeToNameMap[htmlResult.role],
    }

    if (htmlResult.side != null) {
      result.side = spaceMembershipSideToNameMap[htmlResult.side]
    }

    return result
  }

  protected getHtmlResult(entity: User, space?: Space): Promise<SpaceReportPartUserTileHtmlResult> {
    const membership = space?.spaceMemberships?.find((sm) => sm.user.id === entity.id && sm.active)

    const result: SpaceReportPartUserTileHtmlResult = {
      role: membership?.role,
      title: entity.fullName,
      ...(membership && { memberSince: membership.createdAt }),
      dxuser: entity.dxuser,
      link: `${config.api.railsHost}/users/${entity.dxuser}`,
    }

    if (space?.type === SPACE_TYPE.REVIEW) {
      result.side = membership?.side
    }

    return Promise.resolve(result)
  }
}
