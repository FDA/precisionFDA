import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class AlertMessageInputDTO {
  @IsString()
  @IsNotEmpty()
  subject: string

  @IsString()
  @IsNotEmpty()
  message: string

  @IsArray()
  @IsNumber({}, { each: true })
  receiverUserIds: number[]
}
