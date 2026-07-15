import { QueryOrder } from '@mikro-orm/core'
import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { PaginationDTO, SortDefinition } from '@shared/domain/entity/domain/pagination.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE, FILE_STATE_DX, FILE_STATE_PFDA, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { HOME_SCOPE } from '@shared/enums'
import { EntityScope } from '@shared/types/common'
import { TransformAndValidateBoolean } from '@shared/utils/transformers/is-valid-boolean'
import { ToNumberRange } from '@shared/utils/transformers/to-range.decorator'
import { NumberRange } from '@shared/utils/types/range/number-range'

class UserFileFilter {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string

  @IsOptional()
  @IsArray()
  @IsIn([...Object.values(FILE_STATE_DX), ...Object.values(FILE_STATE_PFDA)], { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  states?: FILE_STATE[]

  @IsOptional()
  @ToNumberRange()
  @Type(() => NumberRange)
  size?: NumberRange

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')).map(t => t.trim()).filter(Boolean))
  tags?: string[]
}

class UserFileFields {
  @IsOptional()
  @IsBoolean()
  @TransformAndValidateBoolean()
  license?: boolean

  @IsOptional()
  @IsBoolean()
  @TransformAndValidateBoolean()
  properties?: boolean

  @IsOptional()
  @IsBoolean()
  @TransformAndValidateBoolean()
  tags?: boolean

  @IsOptional()
  @IsBoolean()
  @TransformAndValidateBoolean()
  path?: boolean

  @IsOptional()
  @IsBoolean()
  @TransformAndValidateBoolean()
  origin?: boolean
}

export class UserFilePaginationDTO extends PaginationDTO<UserFile> {
  @IsOptional()
  @IsArray()
  @IsIn([...Object.values(FILE_STI_TYPE)], { each: true })
  type?: FILE_STI_TYPE[]

  @IsOptional()
  @IsNumber()
  @ValidateIf((_, value) => value !== null)
  @Transform(({ value }) => {
    if (value === 'null' || value === '') return null
    const newValue = Number(value)
    return Number.isNaN(newValue) ? value : newValue
  })
  folderId?: number | null

  @IsOptional()
  @IsValidScope({
    allowHomeScope: { me: false, featured: false, everybody: false, spaces: true },
  })
  scope: HOME_SCOPE.SPACES | EntityScope

  @IsOptional()
  @IsArray()
  @Matches(/^[a-zA-Z0-9-]+$/, { each: true }) // allow filtering uids by exact match or partial match (case-insensitive)
  @Transform(({ value }) =>
    (Array.isArray(value) ? value : value.split(',')).filter((uid: string) => uid.trim() !== ''),
  )
  uids?: Uid<'file'>[]

  @IsBoolean()
  @TransformAndValidateBoolean()
  ignoreChallengeBot: boolean = true

  @IsOptional()
  @ValidateNested()
  @Type(() => UserFileFields)
  fields?: UserFileFields

  @IsOptional()
  @ValidateNested()
  @Type(() => UserFileFilter)
  filter?: UserFileFilter

  sort: SortDefinition<UserFile> = { createdAt: QueryOrder.DESC }
}
