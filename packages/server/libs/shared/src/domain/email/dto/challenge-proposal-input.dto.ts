import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ChallengeProposalInputDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  organisation: string

  @IsBoolean()
  @IsNotEmpty()
  specificQuestion: boolean

  @IsOptional()
  @IsString()
  specificQuestionText: string

  @IsBoolean()
  @IsNotEmpty()
  dataDetails: boolean

  @IsOptional()
  @IsString()
  dataDetailsText: string
}
