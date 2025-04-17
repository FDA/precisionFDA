import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsEnum, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { SpaceMembershipDTO } from '@shared/domain/space-event/dto/space-membership.dto'
import { EntityTypeWithValueDTO } from '@shared/domain/space-event/dto/entity-type-with-value-dto'

export class SpaceEventDTO {
  @IsNumber()
  @IsNotEmpty()
  spaceId: number

  @IsNumber()
  @IsNotEmpty()
  userId: number

  @IsOptional()
  @ValidateNested()
  @Type(() => SpaceMembershipDTO)
  membership?: SpaceMembershipDTO | null

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EntityTypeWithValueDTO)
  entity: EntityTypeWithValueDTO

  @IsEnum(SPACE_EVENT_ACTIVITY_TYPE)
  @IsNotEmpty()
  activityType: SPACE_EVENT_ACTIVITY_TYPE

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true }) // Ensures every element in the array is a number
  ignoreUserIds?: number[] // These users will not receive a notification
}
