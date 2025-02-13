import { IsString, IsNotEmpty } from 'class-validator'

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

  @IsString()
  @IsNotEmpty()
  specific_question: string

  @IsString()
  @IsNotEmpty()
  specific_question_text: string

  @IsString()
  @IsNotEmpty()
  data_details: string

  @IsString()
  @IsNotEmpty()
  data_details_text: string
}
