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
import { SortDefinition } from '@shared/domain/entity/domain/pagination.dto'
import {
  ScopedEntityFilter,
  ScopedEntityPaginationDTO,
} from '@shared/domain/entity/domain/scoped-entity-pagination.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE, FILE_STATE_DX, FILE_STATE_PFDA, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { TransformAndValidateBoolean } from '@shared/utils/transformers/is-valid-boolean'
import { ToNumberRange } from '@shared/utils/transformers/to-range.decorator'
import { TransformSortKeys } from '@shared/utils/transformers/transform-sort-keys.decorator'
import { NumberRange } from '@shared/utils/types/range/number-range'

class UserFileFilter extends ScopedEntityFilter {
  @IsOptional()
  @IsNotEmpty()
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

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  addedBy?: string
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

export class UserFilePaginationDTO extends ScopedEntityPaginationDTO<UserFile> {
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
  @IsArray()
  @Matches(/^[a-zA-Z0-9-]+$/, { each: true }) // allow filtering uids by exact match or partial match (case-insensitive)
  @Transform(({ value }) =>
    (Array.isArray(value) ? value : value.split(',')).filter((uid: string) => uid.trim() !== ''),
  )
  uids?: Uid<'file'>[]

  @IsBoolean()
  @TransformAndValidateBoolean()
  ignoreChallengeBot: boolean = true

  @IsBoolean()
  @TransformAndValidateBoolean()
  ignoreComparison: boolean = true

  @IsOptional()
  @IsBoolean()
  @TransformAndValidateBoolean()
  featured?: boolean

  @IsOptional()
  @ValidateNested()
  @Type(() => UserFileFields)
  fields?: UserFileFields

  @IsOptional()
  @ValidateNested()
  @Type(() => UserFileFilter)
  filter?: UserFileFilter

  @TransformSortKeys({ addedBy: 'user.dxuser' })
  sort: SortDefinition<UserFile> = { createdAt: QueryOrder.DESC }
}
