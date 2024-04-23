import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { DATA_PORTAL_STATUS } from '@shared/domain/data-portal/data-portal.enum'

export class CreateDataPortalDTO {
  @IsString()
  name: string

  @IsString()
  urlSlug: string

  @IsString()
  description: string

  @IsString()
  @IsOptional()
  content?: string

  @IsString()
  cardImageFileName: string

  @IsString()
  hostLeadDxUser: string

  @IsString()
  guestLeadDxUser: string

  @IsNumber()
  spaceId: number

  @IsNumber()
  sortOrder: number

  @IsEnum(DATA_PORTAL_STATUS)
  status: DATA_PORTAL_STATUS
}
