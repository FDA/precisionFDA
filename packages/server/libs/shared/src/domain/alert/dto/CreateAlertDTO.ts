import { AlertType, alertTypes } from '@shared/domain/alert/entity/alert.entity'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsString, IsIn, IsDate } from 'class-validator'

export class CreateAlertDTO {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsIn(alertTypes)
  type: AlertType

  // cast from JSON string to Date
  @Type(() => Date)
  @IsDate()
  startTime: Date

  // cast from JSON string to Date
  @Type(() => Date)
  @IsDate()
  endTime: Date
}
