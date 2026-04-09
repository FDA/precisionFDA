import { IsOptional, IsString } from 'class-validator'

export class UpdateSpaceDTO {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsString()
  @IsOptional()
  cts?: string // just for the review spaces
}
