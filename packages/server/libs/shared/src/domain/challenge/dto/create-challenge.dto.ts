import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsNumber, IsString, IsUrl, MaxLength, MinDate, ValidateIf } from 'class-validator'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'
import { EntityScope } from '@shared/types/common'

export class CreateChallengeDTO {
  @IsString()
  @MaxLength(150)
  name: string

  @IsNumber()
  appOwnerId: number

  @IsString()
  @MaxLength(50_000)
  description: string

  @IsString()
  guestLeadDxuser: string

  @IsString()
  hostLeadDxuser: string

  @ValidateIf(o => o.status === CHALLENGE_STATUS.PRE_REGISTRATION)
  @IsUrl()
  preRegistrationUrl: string

  @IsValidScope({ allowPublic: true, allowPrivate: false })
  scope: EntityScope

  // cast from JSON string to Date
  @Type(() => Date)
  @MinDate(new Date(), { message: 'Starting date must be in the future.' })
  @IsDate()
  startAt: Date

  // cast from JSON string to Date
  @Type(() => Date)
  @MinDate(new Date(), { message: 'Ending date must be in the future.' })
  @IsDate()
  endAt: Date

  @IsEnum(CHALLENGE_STATUS)
  status: CHALLENGE_STATUS

  buildEntity(): Challenge {
    const challenge = new Challenge()
    challenge.name = this.name
    challenge.description = this.description
    challenge.status = this.status
    challenge.scope = this.scope
    challenge.startAt = this.startAt
    challenge.endAt = this.endAt
    challenge.preRegistrationUrl = this.preRegistrationUrl ?? ''

    return challenge
  }
}
