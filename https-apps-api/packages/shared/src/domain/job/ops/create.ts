import * as client from '../../../platform-client'
import * as errors from '../../../errors'
import type { RunAppInput } from '../job.input'
import { BaseOperation } from '../../../utils'
import { Job } from '../job.entity'
import { App } from '../../app/app.entity'
import { User, helper as userHelper } from '../../user'
import { JOB_STATE, allowedFeatures, allowedInstanceTypes } from '../job.enum'
import { createJobSyncTask } from '../../../queue'

export class CreateJobOperation extends BaseOperation<RunAppInput, Job> {
  async run(input: RunAppInput): Promise<Job> {
    const em = this.ctx.em

    // todo: how the app is gonna be referenced is not resolved
    const app = await em.findOne(App, { dxid: input.appDxId })
    const user = await em.findOne(User, { id: this.ctx.user.id })

    if (!user) {
      throw new errors.UserNotFoundError()
    }

    if (!app) {
      // cannot run the app -> there should be more business rules to it
      // throw new Error('Jupyter labs app not found')
      console.log('app entry does not exist in our system')
    }

    // appId will be hardcoded or taken from the database..
    const appId = 'app-dxjupyterlab'
    const projectId = userHelper.getProjectForAppType(user, input.httpsAppType)
    const runWithInstanceType = allowedInstanceTypes[input.instanceType]
    // todo: this will differ -> 4 HTTPS app types
    const runWithFeature = allowedFeatures[input.feature] || allowedFeatures.python

    const repo = this.ctx.em.getRepository(Job)

    // todo: handle optional input (.Notebook_snapshotss)
    const newJobClientRes = await client.jobCreate({
      project: projectId,
      name: input.name,
      input: {
        duration: input.duration,
        feature: runWithFeature,
      },
      systemRequirements: {
        '*': {
          instanceType: runWithInstanceType,
        },
      },
      accessToken: this.ctx.user.accessToken,
      appId,
    })
    // add all the data to the database
    const job = repo.create({
      user: em.getReference(User, this.ctx.user.id),
      // NOT PROVIDED FOR NOW, BECAUSE IT IS HARDCODED
      // todo: how to get reference to this? Jupyter app basically
      // app: em.getReference(App, app.id),
      dxid: newJobClientRes.id,
      state: JOB_STATE.IDLE,
      // fixme:
      project: projectId,
      name: input.name,
      // will be resolved later
      describe: {},
      // todo: add option and enum
      scope: 'private',
      // fixme: build this
      runData: {
        run_instance_type: 'foo',
        run_inputs: {},
        run_outputs: {},
      },
      // todo: research this
      provenance: {},
      appSeriesId: null,
    })
    // todo: create Event entry -> low priority probably
    em.persist(job)
    await em.flush()

    await createJobSyncTask({ dxid: job.dxid }, this.ctx.user)
    return job
  }
}
