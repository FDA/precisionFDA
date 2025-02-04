import { ArrayNotEmpty, IsArray, IsBoolean, IsNumber } from 'class-validator'

export class SpacesHiddenDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ids: number[]

  @IsBoolean()
  hidden: boolean
}
