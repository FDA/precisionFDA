import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class EmailBodyDto {
  @IsString()
  @IsNotEmpty()
  subject: string

  @IsString()
  @IsNotEmpty()
  to: string

  @IsString()
  @IsOptional()
  from: string

  @IsString()
  @IsOptional()
  bcc: string

  @IsString()
  @IsOptional()
  replyTo: string

  @IsString()
  @IsOptional()
  body: string
}
