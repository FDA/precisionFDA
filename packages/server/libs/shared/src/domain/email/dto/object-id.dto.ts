import { IsNotEmpty, IsNumber } from 'class-validator'

export class ObjectIdInputDTO {
  @IsNumber()
  @IsNotEmpty()
  id: number
}
