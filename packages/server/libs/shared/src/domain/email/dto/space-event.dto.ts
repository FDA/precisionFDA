import { IsInt, Min } from 'class-validator'

export class SpaceEventDTO {
  @IsInt()
  @Min(1)
  spaceEventId: number
}
