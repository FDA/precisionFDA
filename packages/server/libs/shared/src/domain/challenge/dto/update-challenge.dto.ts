import { IsDate, IsEnum, IsNumber, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { Type } from 'class-transformer'

export class UpdateChallengeDTO {
  @IsString()
  @MaxLength(150)
  name: string

  @IsNumber()
  appOwnerId: number

  @IsString()
  @MaxLength(50_000)
  description: string

  @ValidateIf((o) => o.status === CHALLENGE_STATUS.PRE_REGISTRATION)
  @IsUrl()
  preRegistrationUrl?: string

  // cast from JSON string to Date
  @Type(() => Date)
  @IsDate()
  startAt: Date

  // cast from JSON string to Date
  @Type(() => Date)
  @IsDate()
  endAt: Date

  @IsEnum(CHALLENGE_STATUS)
  status: CHALLENGE_STATUS
}
