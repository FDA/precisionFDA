import { IsArray, IsString } from 'class-validator'
import { JobStaleCheckDTO } from './job-stale-check.dto'

export class AdminStaleJobsReportDTO {
  @IsArray()
  jobsInfo: JobStaleCheckDTO[]

  @IsString()
  maxDuration: string
}
