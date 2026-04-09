import { IsOptional, IsString, MaxLength } from 'class-validator'
import { config } from '@shared/config'

export class UpdateDbClusterDTO {
  @IsString()
  @MaxLength(config.validation.maxStrLen)
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
