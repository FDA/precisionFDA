import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class NewsItemDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string

  @IsDateString()
  createdAt: Date

  @IsString()
  @IsOptional()
  @MaxLength(255)
  video?: string

  @IsString()
  @MinLength(3)
  @MaxLength(100000)
  content: string

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  link: string

  @IsOptional()
  isPublication?: boolean

  @IsOptional()
  published?: boolean
}
