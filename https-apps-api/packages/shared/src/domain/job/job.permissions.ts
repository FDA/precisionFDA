import { JobNotFoundError, PermissionError } from '../../errors'
import { UserOpsCtx } from '../../types'
import { Job } from "./job.entity"
import { App } from '../app/app.entity'


// Check if job exists and is accessible by the user
export const getJobAccessibleByContext = async (jobDxid: string, ctx: UserOpsCtx): Promise<Job> => {
  const jobRepo = ctx.em.getRepository(Job)
  const job = await jobRepo.findOne({ dxid: jobDxid }, {
    populate: ['user'],
  })
  if (!job) {
    throw new JobNotFoundError()
  }

  if (job.user.id !== ctx.user.id) {
    throw new PermissionError('Error: User does not have permissions to access this job')
  }
  return job
}

export const getJobForApp = async (jobDxid: string, appId: number, ctx: UserOpsCtx): Promise<Job> => {
  const jobRepo = ctx.em.getRepository(Job)
  const job = await jobRepo.findOne(
    {
      dxid: jobDxid,
      app: ctx.em.getReference(App, appId),
    }
  )

  if (!job) {
    throw new JobNotFoundError()
  }
  return job
}
