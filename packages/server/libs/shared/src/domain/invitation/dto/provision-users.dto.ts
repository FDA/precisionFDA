import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator'

export class ProvisionUsersDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[]
}
