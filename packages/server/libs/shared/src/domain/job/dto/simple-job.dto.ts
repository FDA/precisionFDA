import { Uid } from '@shared/domain/entity/domain/uid'
import { Job } from '../job.entity'
import { JOB_STATE } from '../job.enum'

export class SimpleJobDTO {
  duration: string
  uid: Uid<'job'>
  name: string
  link: string
  state: JOB_STATE

  static fromEntity(job: Job, link: string): SimpleJobDTO {
    const jobDTO = new SimpleJobDTO()
    jobDTO.uid = job.uid
    jobDTO.name = job.name
    jobDTO.link = link
    jobDTO.state = job.state
    jobDTO.duration = job.elapsedTimeSinceCreationString()
    return jobDTO
  }
}
