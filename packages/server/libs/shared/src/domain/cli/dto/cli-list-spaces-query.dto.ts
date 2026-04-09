import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsOptional } from 'class-validator'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { TransformAndValidateBoolean } from '@shared/utils/transformers/is-valid-boolean'
import { TransformEnumKey } from '@shared/utils/transformers/transform-enum-key.decorator'

export class CliListSpacesQueryDTO {
  @IsOptional()
  @TransformEnumKey(SPACE_STATE)
  @IsEnum(SPACE_STATE)
  state?: SPACE_STATE

  @IsOptional()
  @TransformAndValidateBoolean()
  protected?: boolean

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsEnum(SPACE_TYPE, { each: true })
  types?: SPACE_TYPE[]
}
