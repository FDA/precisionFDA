import { Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CliNodeSearchDTO {
  @IsString()
  @IsNotEmpty()
  arg: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  spaceId: number | null

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  folderId: number | null

  @IsString()
  @IsIn(['UserFile', 'Folder'])
  @IsNotEmpty()
  type: 'UserFile' | 'Folder'
}
