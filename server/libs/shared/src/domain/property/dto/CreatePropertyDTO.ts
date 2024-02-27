import { PropertyType, propertyTypes } from '@shared/domain/property/property.entity'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsObject, ValidateNested } from 'class-validator'

class Property {
  [key: string]: string
}
export class CreatePropertyDTO {
  @IsInt()
  targetId: number

  @IsIn(propertyTypes)
  targetType: PropertyType

  @IsObject()
  @ValidateNested()
  @Type(() => Property)
  properties: Property
}
