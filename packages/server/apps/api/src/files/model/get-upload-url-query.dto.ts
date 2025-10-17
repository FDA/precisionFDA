import { Type } from 'class-transformer'
import { IsInt, IsPositive, IsString, Length } from 'class-validator'

export class GetUploadUrlQueryDTO {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  index: number

  @IsString()
  @Length(32, 32, { message: 'md5 must be a 32-character hex string' })
  md5: string

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  size: number
}
