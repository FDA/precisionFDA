import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateFileParamDTO {
  @IsNumber()
  @IsOptional()
  id?: number

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
