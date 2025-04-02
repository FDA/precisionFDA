import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class HeaderItem {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsBoolean()
  @IsNotEmpty()
  favorite: boolean

  constructor(name: string, favorite: boolean) {
    this.name = name
    this.favorite = favorite
  }
}
