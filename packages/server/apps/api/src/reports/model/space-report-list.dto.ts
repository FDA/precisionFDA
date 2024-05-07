import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { EntityScope } from '@shared/types/common'

export class SpaceReportListQueryDto {
  @IsValidScope({ allowPublic: false })
  scope: EntityScope
}
