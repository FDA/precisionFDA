import { EmailAddress } from '@shared/domain/email/model/email-address'
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class RequestAccessDTO {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  captchaValue?: string

  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string

  @IsEmail()
  email: EmailAddress

  @IsString()
  duns: string

  @IsString()
  @IsNotEmpty()
  reason: string

  @IsBoolean()
  participateIntent: boolean = false

  @IsBoolean()
  organizeIntent: boolean = false

  @IsString()
  reqData: string

  @IsString()
  reqSoftware: string

  @IsBoolean()
  researchIntent: boolean = false

  @IsBoolean()
  clinicalIntent: boolean = false

  @IsString()
  @IsOptional()
  ip?: string
}
