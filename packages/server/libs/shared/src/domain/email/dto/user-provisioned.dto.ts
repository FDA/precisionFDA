import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { EmailAddress } from '@shared/domain/email/model/email-address'

export class UserProvisionedDTO {
  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  username: string

  @IsEmail()
  @IsNotEmpty()
  email: EmailAddress
}
