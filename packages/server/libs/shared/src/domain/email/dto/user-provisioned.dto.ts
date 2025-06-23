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
  email: string
}
