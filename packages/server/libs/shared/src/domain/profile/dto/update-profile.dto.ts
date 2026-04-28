import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * Request DTO for updating profile
 */
export class UpdateProfileDTO {
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null

  // Required for email change authentication
  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  @IsString()
  otp?: string
}
