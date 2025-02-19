import { Uid } from '@shared/domain/entity/domain/uid'
import { IsNumber, IsOptional, IsString } from 'class-validator'

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

  @IsString()
  @IsOptional()
  content?: string

  @IsString()
  @IsOptional()
  editorState?: string
}
