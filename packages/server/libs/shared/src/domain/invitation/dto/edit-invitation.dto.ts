import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'
import { EmailAddress } from '@shared/domain/email/model/email-address'

export class EditInvitationDTO {
  @IsString()
  @IsOptional()
  @MinLength(1)
  firstName?: string

  @IsString()
  @IsOptional()
  @MinLength(1)
  lastName?: string

  @IsEmail()
  @IsOptional()
  @MinLength(1)
  email?: EmailAddress
}
