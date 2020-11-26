import { prop } from 'ramda'
import * as client from '../../../platform-client'
import * as errors from '../../../errors'
import type { RunAppInput } from '../job.input'
import { BaseOperation } from '../../../utils'
import { Job } from '../job.entity'
import { App, helper as appHelper } from '../../app'
import { User, helper as userHelper } from '../../user'
import {
  JOB_STATE,
  allowedFeatures,
  allowedInstanceTypes,
  JOB_DB_ENTITY_TYPE,
  DEFAULT_INSTANCE_TYPE,
} from '../job.enum'
import { createJobSyncTask } from '../../../queue'
import { APP_HTTPS_SUBTYPE } from '../../app/app.enum'
import { AnyObject } from '../../../types'

export class CreateJobOperation extends BaseOperation<RunAppInput, Job> {
  private input: RunAppInput
  private projectId: string

  async run(input: RunAppInput): Promise<Job> {
    this.input = input
    const em = this.ctx.em

    const app = await em.findOne(App, { dxid: input.appDxId })
    const user = await em.findOne(User, { id: this.ctx.user.id })

    if (!user) {
      throw new errors.UserNotFoundError()
    }

    if (!app) {
      throw new errors.NotFoundError(`App dxid: ${input.appDxId} not found`, {
        code: errors.ErrorCodes.APP_NOT_FOUND,
      })
    }
    // todo: use class context for everything or nothing
    const platformAppId = appHelper.getAppHandle({ app, appType: input.httpsAppType })
    this.projectId = userHelper.getProjectForAppType(user, input.httpsAppType)
    const runWithInstanceType =
      this.input.instanceType && allowedInstanceTypes[this.input.instanceType]
        ? allowedInstanceTypes[this.input.instanceType]
        : DEFAULT_INSTANCE_TYPE
    const runInputDb = this.buildJobRunInput({ app })
    const runDxInput = this.buildClientApiCall({ app, platformAppId })
    const jobName = input.name ?? app.title

    const repo = this.ctx.em.getRepository(Job)
    // todo: handle different inputs for different app types
    const newJobClientRes = await client.jobCreate(runDxInput)
    // todo: transaction (explicit? consider.. maybe with provenance later)
    // add all the data to the database
    const job = repo.create({
      user: em.getReference(User, this.ctx.user.id),
      app: em.getReference(App, app.id),
      dxid: newJobClientRes.id,
      state: JOB_STATE.IDLE,
      project: this.projectId,
      name: jobName,
      // will be resolved later
      describe: {},
      scope: input.scope,
      entityType: JOB_DB_ENTITY_TYPE.HTTPS,
      runData: {
        run_instance_type: runWithInstanceType,
        run_inputs: runInputDb,
        run_outputs: {},
      },
      // todo: gotta implement files first!
      provenance: {},
      appSeriesId: app.appSeriesId,
      uid: `${newJobClientRes.id}-1`,
    })
    // todo: create Event entry -> low priority probably
    em.persist(job)
    await em.flush()

    await createJobSyncTask({ dxid: job.dxid }, this.ctx.user)
    return job
  }

  private parseAppSpec(app: App): AnyObject {
    const appSpec = app.spec
    return JSON.parse(appSpec)
  }

  private getDefaultSpecValue(app: App, key: string): string | number {
    const inputSpec: any[] = prop('input_spec', this.parseAppSpec(app))
    if (!inputSpec || !Array.isArray(inputSpec)) {
      throw new errors.InternalError('Input spec is not set or it is not an array')
    }

    const value = inputSpec.find(entry => entry.name === key)
    if (!value) {
      throw new errors.InternalError(`Unknown input spec key ${key}`)
    }
    if (!value.default) {
      throw new errors.InternalError(
        `Input spec key ${key} does not have default value - it is not optional`,
      )
    }
    return value.default
  }

  // refactor both!
  private buildJobRunInput({ app }: { app: App }) {
    // todo: switch?
    if (this.input.httpsAppType === APP_HTTPS_SUBTYPE.TTYD) {
      return {}
    } else if (this.input.httpsAppType === APP_HTTPS_SUBTYPE.SHINY) {
      throw new Error('not yet supported')
    } else if (this.input.httpsAppType === APP_HTTPS_SUBTYPE.JUPYTER) {
      // const appSpec = app.spec
      // const inputSpec: any[] = prop('input_spec', JSON.parse(appSpec))
      // const findInputProp = (key: string) => inputSpec.find(entry => entry.name === key)
      const jobSpecificInput = this.input.input
      const runInput = {
        duration:
          jobSpecificInput && jobSpecificInput.duration
            ? jobSpecificInput.duration
            : this.getDefaultSpecValue(app, 'duration'),
        feature:
          jobSpecificInput && jobSpecificInput.feature
            ? allowedFeatures[jobSpecificInput.feature]
            : this.getDefaultSpecValue(app, 'feature'),
      }
      // todo: test if this
      if (jobSpecificInput?.snapshot) {
        runInput['snapshot'] = jobSpecificInput.snapshot
      }
      return runInput
    } else {
      throw new Error(`Unsupported app type ${this.input.httpsAppType}`)
    }
  }

  private buildClientApiCall({
    app,
    platformAppId,
  }: {
    app: App
    platformAppId: string
  }): client.JobCreateParams {
    const runWithInstanceType =
      this.input.instanceType && allowedInstanceTypes[this.input.instanceType]
        ? allowedInstanceTypes[this.input.instanceType]
        : DEFAULT_INSTANCE_TYPE
    // shared payload here
    const payload: client.JobCreateParams = {
      project: this.projectId,
      accessToken: this.ctx.user.accessToken,
      appId: platformAppId,
      systemRequirements: {
        '*': {
          instanceType: runWithInstanceType,
        },
      },
      name: this.input.name,
      input: {},
    }
    // customizations based on app type
    if (this.input.httpsAppType === APP_HTTPS_SUBTYPE.JUPYTER) {
      const jobInputs = this.input.input
      const feature =
        jobInputs?.feature && allowedFeatures[jobInputs.feature]
          ? allowedFeatures[jobInputs.feature]
          : this.getDefaultSpecValue(app, 'feature')
      const duration = jobInputs?.duration ?? this.getDefaultSpecValue(app, 'duration')
      // default jupyter values
      payload.input = {
        duration,
        feature,
      }
      if (jobInputs?.snapshot) {
        payload.snapshot = {
          $dnanexus_link: {
            id: jobInputs.snapshot,
            project: this.projectId,
          },
        }
      }
    } else if (this.input.httpsAppType === APP_HTTPS_SUBTYPE.TTYD) {
      payload.input = {}
    }
    return payload
  }
}
