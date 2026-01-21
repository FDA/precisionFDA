import { IsArray, IsObject } from 'class-validator'
import { SimpleJobDTO } from './simple-job.dto'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'

export class UserRunningJobsReportDTO {
  @IsArray()
  runningJobs: SimpleJobDTO[]

  @IsObject()
  jobOwner: SimpleUserDTO
}
