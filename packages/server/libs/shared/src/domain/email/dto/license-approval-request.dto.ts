import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class LicenseApprovalRequestDTO {
  @IsNumber()
  @IsNotEmpty()
  license_id: number

  @IsNumber()
  @IsNotEmpty()
  user_id: number

  @IsString()
  @IsNotEmpty()
  message: string
}
