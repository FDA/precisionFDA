import { IsEnum, IsString } from 'class-validator'

export enum CHALLENGE_CONTENT_TYPE {
  PRE_REGISTRATION = 'pre-registration',
  INFO = 'info',
  RESULTS = 'results',
}

export class UpdateChallengeContentDTO {
  @IsEnum(CHALLENGE_CONTENT_TYPE)
  type: CHALLENGE_CONTENT_TYPE

  @IsString()
  content: string

  @IsString()
  editorState: string
}
