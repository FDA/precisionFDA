import { Transform } from 'class-transformer'
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator'
import { IsValidDxid } from '@shared/domain/entity/constraint/is-dxid-valid.constraint'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { STATIC_SCOPE } from '@shared/enums'
import { EntityScope } from '@shared/types/common'
import { PARENT_TYPE } from '../user-file.types'

export class UserFileCreateDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @Transform(({ value }) => (value === null || value === undefined || value === '' ? 'private' : value))
  @IsValidScope()
  scope: EntityScope = STATIC_SCOPE.PRIVATE

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsNumber()
  folderId?: number

  @IsOptional()
  @IsString()
  description?: string

  @ValidateIf(o => o.parentId != null && o.parentId !== '')
  @IsNotEmpty()
  @IsIn([PARENT_TYPE.JOB])
  parentType: PARENT_TYPE.JOB

  @ValidateIf(o => o.parentType != null && o.parentType !== '')
  @IsNotEmpty()
  @IsValidDxid({ entityType: 'job' })
  parentId: DxId<'job'>
}
