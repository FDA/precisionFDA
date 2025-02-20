import { IsNotEmpty, IsString } from 'class-validator'

export class AlertMessageInputDTO {
  @IsString()
  @IsNotEmpty()
  subject: string

  @IsString()
  @IsNotEmpty()
  message: string
}
