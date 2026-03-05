import { IsNotEmpty, IsString } from 'class-validator'

export class CliExchangeTokenInputDTO {
  @IsString()
  @IsNotEmpty()
  code: string
}
