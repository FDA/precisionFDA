import { EmailAddress } from '@shared/domain/email/model/email-address'
import { IsString, IsNotEmpty, IsEmail } from 'class-validator'

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
