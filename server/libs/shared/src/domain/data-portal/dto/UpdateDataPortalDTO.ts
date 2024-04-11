import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { DATA_PORTAL_STATUS } from '@shared/domain/data-portal/data-portal.enum'

export class UpdateDataPortalDTO {
  @IsNumber()
  id: number

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsBoolean()
  @IsOptional()
  default?: boolean

  @IsNumber()
  @IsOptional()
  sortOrder?: number

  @IsString()
  @IsOptional()
  cardImageUid?: string

  @IsEnum(DATA_PORTAL_STATUS)
  @IsOptional()
  status?: DATA_PORTAL_STATUS

  @IsString()
  @IsOptional()
  content?: string

  @IsString()
  @IsOptional()
  editor_state?: string
}
