import { IsBoolean } from 'class-validator'

export class SpaceReportCreateJsonOptionsDto {
  @IsBoolean()
  prettyPrint: boolean = false
}
