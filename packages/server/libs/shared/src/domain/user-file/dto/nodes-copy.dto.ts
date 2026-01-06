import { ArrayNotEmpty, IsArray, IsInt, IsOptional } from 'class-validator'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { EntityScope } from '@shared/types/common'
import { Type } from 'class-transformer'

export class NodesCopyDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[]

  @IsValidScope()
  scope: EntityScope

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  folderId?: number
}
