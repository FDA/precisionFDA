import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { SimpleJobDTO } from './simple-job.dto'

export class JobStaleCheckDTO {
  user: SimpleUserDTO
  staleJobs: SimpleJobDTO[]
  nonStaleJobs: SimpleJobDTO[]
}
