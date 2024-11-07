import { IsArray, IsNotEmpty, IsObject, IsOptional } from 'class-validator'

export class TypedEmailBodyDto {
  @IsObject()
  @IsNotEmpty()
  input: Record<string, string>

  @IsArray()
  @IsOptional()
  receiverUserIds?: number[]
}
