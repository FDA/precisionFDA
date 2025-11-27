import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator'

export class NoteQueryParamsDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ids: number[]
}
