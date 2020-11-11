import { client } from '@pfda/https-apps-shared'
import type { RunAppInput } from '../domain/job.input'
import { BaseOperation } from '../../utils'
import { Job } from '../job.entity'
import { App } from '../../apps'
import { User } from '../../users'
import { JOB_STATE, allowedFeatures, allowedInstanceTypes } from '../domain/job.enum'

export class CreateJobOperation extends BaseOperation<RunAppInput, Job> {
  async run(input: RunAppInput) {
    // todo: test if user exists and can do this!
    const em = this.ctx.em

    // todo: how the app is gonna be referenced is not resolved
    const app = await em.findOne(App, { dxid: input.appDxId })
    const user = await em.findOne(User, { id: this.ctx.user.id })
    // todo: PROJECT should be determined based on app type (subtype) -> maps to user.projects DB fields
    const projectId = user.privateFilesProject
    const runWithInstanceType = allowedInstanceTypes[input.instanceType]
    // todo: this will differ -> 4 HTTPS app types
    const runWithFeature = allowedFeatures[input.feature] || allowedFeatures.python

    if (!app) {
      // cannot run the app -> there should be more business rules to it
      // throw new Error('Jupyter labs app not found')
      console.log('app entry does not exist in our system')
    }

    const repo = this.ctx.em.getRepository(Job)

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
      // THIS IS HARDCODED JUPYTER LAB APP ID from the pfda_autotest1 user!
      appId: 'app-FxfQ8J85KV59Vq705Jq5KgfP',
      // appId: input.appDxId,
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
      // fixme: build this, correct encoding in the DB
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

    // todo: add task to a worker queue

    return job
  }
}
