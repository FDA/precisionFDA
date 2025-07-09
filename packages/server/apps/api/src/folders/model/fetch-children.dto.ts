import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { SCOPE } from '@shared/types/common'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'

export class FetchChildrenDTO {
  @IsArray()
  @IsValidScope({}, { each: true })
  scopes: SCOPE[]

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  folderId?: number

  @IsOptional()
  @IsArray()
  @IsEnum(FILE_STI_TYPE, { each: true })
  types?: FILE_STI_TYPE[]
}
