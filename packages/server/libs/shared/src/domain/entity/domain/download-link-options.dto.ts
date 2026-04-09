import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsPositive } from 'class-validator'
import { TransformAndValidateBoolean } from '@shared/utils/transformers/is-valid-boolean'

export class DownloadLinkOptionsDto {
  @TransformAndValidateBoolean()
  @IsOptional()
  inline?: boolean

  @TransformAndValidateBoolean()
  @IsOptional()
  preauthenticated?: boolean

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  duration?: number
}
