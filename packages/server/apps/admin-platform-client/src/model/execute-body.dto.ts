import { IsArray, IsString } from 'class-validator'

export class ExecuteBodyDto {
  @IsString()
  method: string

  @IsArray()
  params: unknown[] = []
}
