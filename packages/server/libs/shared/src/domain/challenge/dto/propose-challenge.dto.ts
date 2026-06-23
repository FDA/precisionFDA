import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator'

export class ProposeChallengeDTO {
  @IsString()
  name: string

  @IsEmail()
  @IsString()
  email: string

  @IsOptional()
  @IsString()
  organisation?: string

  @IsOptional()
  @IsBoolean()
  specificQuestion?: boolean

  @IsOptional()
  @IsString()
  specificQuestionText?: string

  @IsOptional()
  @IsBoolean()
  dataDetails?: boolean

  @IsOptional()
  @IsString()
  dataDetailsText?: string

  @IsOptional()
  @IsString()
  captchaValue?: string
}
