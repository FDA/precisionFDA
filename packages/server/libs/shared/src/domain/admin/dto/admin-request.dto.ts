import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator'

export class AdminRequestDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[]
}
