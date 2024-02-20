import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { SpaceReportPartUserTileResult } from '@shared/domain/space-report/model/space-report-part-user-tile-result'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { User } from '@shared/domain/user/user.entity'
import { SpaceReportPartResultProvider } from './space-report-part-result.provider'

@Injectable()
export class SpaceReportPartUserResultProvider implements SpaceReportPartResultProvider<'user'> {
  getResult(entity: User, space: Space): Promise<SpaceReportPartUserTileResult> {
    const membership = space.spaceMemberships.find((sm) => sm.user.id === entity.id && sm.active)

    const result: SpaceReportPartUserTileResult = {
      role: membership?.role,
      title: entity.fullName,
      memberSince: membership?.createdAt,
      dxuser: entity.dxuser,
      link: `${config.api.railsHost}/users/${entity.dxuser}`,
    }

    if (space.type === SPACE_TYPE.REVIEW) {
      result.side = membership?.side
    }

    return Promise.resolve(result)
  }
}
