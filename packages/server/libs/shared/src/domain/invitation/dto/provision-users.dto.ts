import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator'

export class ProvisionUsersDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[]

  // Array of spaces IDs where the users will be provisioned (ONLY applies to new FDA users)
  @IsArray()
  @IsInt({ each: true })
  spaceIds: number[]
}
