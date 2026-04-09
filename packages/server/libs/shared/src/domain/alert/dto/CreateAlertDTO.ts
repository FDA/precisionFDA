import { Type } from 'class-transformer'
import { IsDate, IsIn, IsNotEmpty, IsString } from 'class-validator'
import { AlertType, alertTypes } from '@shared/domain/alert/entity/alert.entity'

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
