import { IsOptional } from 'class-validator'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { STATIC_SCOPE } from '@shared/enums'
import { EntityScope } from '@shared/types/common'

export class CliScopeQueryDTO {
  @IsOptional()
  @IsValidScope({ allowHomeScope: false })
  scope: EntityScope = STATIC_SCOPE.PRIVATE
}
