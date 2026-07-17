import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'

const MAX_ARCHIVE_ENTRIES = 100000
const MAX_PATH_LENGTH = 4096

export class AssetCreateDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/\.tar(\.gz)?$/, { message: 'Asset name must end with .tar or .tar.gz' })
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_ARCHIVE_ENTRIES)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(MAX_PATH_LENGTH, { each: true })
  paths: string[]
}
