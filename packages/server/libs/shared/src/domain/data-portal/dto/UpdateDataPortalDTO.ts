import { DATA_PORTAL_STATUS } from '@shared/domain/data-portal/data-portal.enum'
import { Uid } from '@shared/domain/entity/domain/uid'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateDataPortalDTO {
  @IsNumber()
  id: number

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsOptional()
  sortOrder?: number

  @IsString()
  @IsOptional()
  cardImageUid?: Uid<'file'>

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
