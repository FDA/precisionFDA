import { IsArray, IsObject } from 'class-validator'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { SimpleJobDTO } from './simple-job.dto'

export class UserRunningJobsReportDTO {
  @IsArray()
  runningJobs: SimpleJobDTO[]

  @IsObject()
  jobOwner: SimpleUserDTO
}
