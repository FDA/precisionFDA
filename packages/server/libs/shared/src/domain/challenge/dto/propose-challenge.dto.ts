import { IsOptional, IsString } from 'class-validator'

export class ProposeChallengeDTO {
  @IsString()
  name: string

  @IsString()
  email: string

  @IsString()
  organisation: string

  @IsString()
  specificQuestion: string

  @IsString()
  specificQuestionText: string

  @IsString()
  dataDetails: string

  @IsString()
  dataDetailsText: string

  @IsOptional()
  @IsString()
  captchaValue?: string
}
