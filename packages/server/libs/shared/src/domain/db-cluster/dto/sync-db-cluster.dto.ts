import { IsNumber } from 'class-validator'

export class SyncDbClusterDTO {
  @IsNumber()
  spaceId: number
}
