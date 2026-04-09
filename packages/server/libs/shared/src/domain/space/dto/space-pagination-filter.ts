import { Type } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { TransformAndValidateBoolean } from '@shared/utils/transformers/is-valid-boolean'
import { TransformEnumKey } from '@shared/utils/transformers/transform-enum-key.decorator'

export class SpacePaginationFilter {
  @IsOptional()
  @Type(() => String)
  id?: string

  @IsOptional()
  @TransformAndValidateBoolean()
  hidden?: boolean

  @IsOptional()
  @Type(() => String)
  name?: string

  @IsOptional()
  @TransformEnumKey(SPACE_STATE)
  @IsEnum(SPACE_STATE)
  state?: SPACE_STATE

  @IsOptional()
  @Type(() => String)
  tags?: string

  @IsOptional()
  @TransformEnumKey(SPACE_TYPE)
  @IsEnum(SPACE_TYPE)
  type?: SPACE_TYPE
}
