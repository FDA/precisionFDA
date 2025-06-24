import { IsString, IsOptional, IsNumber, IsNotEmpty, IsIn } from 'class-validator'
import { Type } from 'class-transformer'

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
