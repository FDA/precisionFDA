import { wrap } from '@mikro-orm/core'
import { Job } from '../job'
import { User } from '../user'
import { JobClosedEvent } from './job-closed.entity'

const createJobClosed = async (user: User, job: Job): Promise<JobClosedEvent> => {
  const event = new JobClosedEvent()
  const app = job.app.isInitialized() ? job.app.getEntity() : await job.app.load()
  const organization = user.organization.isInitialized()
    ? user.organization.getEntity()
    : await user.organization.load()
  wrap(event).assign({
    type: 'Event::JobClosed',
    orgHandle: organization.handle,
    dxuser: user.dxuser,
    param1: job.dxid,
    param2: app.dxid,
  })
  return event
}

export { createJobClosed }
