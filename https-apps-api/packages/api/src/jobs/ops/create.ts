import { client } from '@pfda/https-apps-shared'
import type { RunAppInput } from '../domain/job.input'
import { BaseOperation } from '../../utils'
import { Job } from '../job.entity'
import { App } from '../../apps'
import { User } from '../../users'
import { JOB_STATE, allowedFeatures, allowedInstanceTypes } from '../domain/job.enum'

export class CreateJobOperation extends BaseOperation<RunAppInput, Job> {
  async run(input: RunAppInput) {
    console.log(input, this.ctx.user, '!')
    // todo: test if user exists and can do this!
    const em = this.ctx.em
    // not sure if this is even needed
    // const appRepo = em.getRepository(App)
    // todo: use DB ids or platform uids? should decide ...
    const app = await em.findOne(App, { dxid: input.appDxId })
    const user = await em.findOne(User, { id: this.ctx.user.id })
    // todo: should check we can run under this project, if provided
    const projectId = input.projectId || user.privateFilesProject
    const runWithInstanceType = allowedInstanceTypes[input.instanceType]
    const runWithFeature = allowedFeatures[input.feature] || allowedFeatures.python
    console.log(app, user, '!')
    console.log(projectId, runWithFeature, runWithInstanceType, 'DEBUG')
    if (!app) {
      // cannot run the app -> there should be more business rules to it
      // throw new Error('Jupyter labs app not found')
      console.log('app entry does not exist in our system')
    }

    /**
     * todo: output serializers
     */

    const repo = this.ctx.em.getRepository(Job)

    // todo: debug duration format
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

    return job
  }
}
