import { config } from '@shared/config'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateDbClusterDTO {
  @IsString()
  @MaxLength(config.validation.maxStrLen)
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
