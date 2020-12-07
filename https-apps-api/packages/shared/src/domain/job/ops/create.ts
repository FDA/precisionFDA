import { prop } from 'ramda'
import * as client from '../../../platform-client'
import * as errors from '../../../errors'
import type { RunAppInput, Provenance } from '../job.input'
import { BaseOperation } from '../../../utils'
import { Job } from '../job.entity'
import { App } from '../../app'
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
import { AnyObject, Maybe } from '../../../types'
import { UserFile } from '../..'

export class CreateJobOperation extends BaseOperation<RunAppInput, Job> {
  private input: RunAppInput
  private projectId: string

  async run(input: RunAppInput): Promise<Job> {
    this.input = input
    const em = this.ctx.em

    const user = await em.findOne(User, { id: this.ctx.user.id })
    // whitelist https public apps
    const app = await em.getRepository(App).findPublic(input.appDxId)

    if (!user) {
      throw new errors.UserNotFoundError()
    }

    if (!app) {
      throw new errors.NotFoundError(`App dxid: ${input.appDxId} not found`, {
        code: errors.ErrorCodes.APP_NOT_FOUND,
      })
    }
    const platformAppId = app.dxid
    this.projectId = userHelper.getProjectForAppType(user, input.httpsAppType)
    const runWithInstanceType =
      this.input.instanceType && allowedInstanceTypes[this.input.instanceType]
        ? allowedInstanceTypes[this.input.instanceType]
        : DEFAULT_INSTANCE_TYPE
    const runInputDb = this.buildJobRunInput({ app })
    const runDxInput = this.buildClientApiCall({ app, platformAppId })
    const jobName = input.name ?? app.title
    // todo: more conditions, user can use the file -> could be the spaces again etc
    const snapshotFile =
      input.input && input.input.snapshot
        ? await em.findOne(UserFile, { dxid: input.input?.snapshot })
        : null

    // todo: should be only allowed for apps that work with snapshots
    if (input.input?.snapshot && !snapshotFile) {
      throw new errors.NotFoundError(`User file dxid: ${input.input.snapshot} not found`, {
        code: errors.ErrorCodes.USER_FILE_NOT_FOUND,
      })
    }

    const repo = this.ctx.em.getRepository(Job)
    const newJobClientRes = await client.jobCreate(runDxInput)
    // add all the data to the database
    await em.begin()
    let job: Job
    try {
      job = repo.create({
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
        provenance: {},
        appSeriesId: app.appSeriesId,
        uid: `${newJobClientRes.id}-1`,
      })
      // todo: create Event entry -> low priority probably
      em.persist(job)
      job.provenance = this.buildProvenance({ app, job, snapshot: snapshotFile })
      await em.flush()

      if (snapshotFile) {
        const jobFilesRepo = this.ctx.em.getRepository(UserFile)
        await jobFilesRepo.createUserFileJobRefs([snapshotFile.id], job.id)
      }
      await em.commit()
    } catch (err) {
      await em.rollback()
      throw err
    }

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

  private buildProvenance({
    app,
    job,
    snapshot,
  }: {
    app: App
    job: Job
    snapshot: Maybe<UserFile>
  }): Provenance {
    const initValue = { [job.dxid]: { app_dxid: app.dxid, app_id: app.id, inputs: {} } }
    if (snapshot) {
      initValue[job.dxid].inputs = { snapshot: snapshot.dxid }
    }
    // todo: add parent files provenance?
    return initValue
  }

  // job.run_data JSON field
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
      if (jobSpecificInput?.snapshot) {
        runInput['snapshot'] = jobSpecificInput.snapshot
      }
      if (jobSpecificInput?.cmd) {
        runInput['cmd'] = jobSpecificInput.cmd
      }
      if (jobSpecificInput?.imagename) {
        runInput['imagename'] = jobSpecificInput.imagename
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
      // mandatory input fields
      const feature =
        jobInputs?.feature && allowedFeatures[jobInputs.feature]
          ? allowedFeatures[jobInputs.feature]
          : this.getDefaultSpecValue(app, 'feature')
      const duration = jobInputs?.duration ?? this.getDefaultSpecValue(app, 'duration')
      payload.input = {
        duration,
        feature,
      }
      // optional input fields
      if (jobInputs?.snapshot) {
        payload['input']['snapshot'] = {
          $dnanexus_link: {
            id: jobInputs.snapshot,
            project: this.projectId,
          },
        }
      }
      if (jobInputs?.cmd) {
        payload['input']['cmd'] = jobInputs.cmd
      }
      if (jobInputs?.imagename) {
        payload['input']['imagename'] = jobInputs.imagename
      }
    } else if (this.input.httpsAppType === APP_HTTPS_SUBTYPE.TTYD) {
      payload.input = {}
    }
    return payload
  }
}
