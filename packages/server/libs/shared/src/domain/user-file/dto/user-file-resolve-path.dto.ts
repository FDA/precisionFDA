import { Transform } from 'class-transformer'
import { IsIn, IsOptional, IsString } from 'class-validator'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { EntityScope } from '@shared/types/common'

export class UserFileResolvePathDTO {
  @IsString()
  @IsOptional()
  @Transform(path => path.value || '/')
  path: string = '/'

  @IsValidScope()
  scope: EntityScope

  @IsOptional()
  @IsIn(['file', 'folder', ''])
  @Transform(type => type.value || null)
  type: 'folder' | 'file' | null = null
}
