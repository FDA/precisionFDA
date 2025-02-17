import { IsNumber, IsOptional, IsString } from 'class-validator'

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
  sortOrder: number
}
