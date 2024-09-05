import { IsArray, IsBoolean, IsOptional } from 'class-validator'

export class NodesInputDTO {
  @IsArray()
  ids: number[]

  @IsOptional()
  @IsBoolean()
  async?: boolean
}
