import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

/**
 * Request DTO for updating organization name
 */
export class UpdateOrganizationDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string
}
