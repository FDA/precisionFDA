import { difference, intersection, isNil, prop } from 'ramda'
import * as client from '../../../platform-client'
import * as errors from '../../../errors'
import type { RunAppInput, Provenance } from '../job.input'
import { BaseOperation } from '../../../utils'
import { Job } from '../job.entity'
import { App } from '../../app'
import { User, helper as userHelper } from '../../user'
import {
  JOB_STATE,
  allowedInstanceTypes,
  JOB_DB_ENTITY_TYPE,
  DEFAULT_INSTANCE_TYPE,
} from '../job.enum'
import { createSyncJobStatusTask } from '../../../queue'
import { AppInputSpecItem } from '../../app/app.enum'
import { AnyObject, UserOpsCtx } from '../../../types'
import { UserFile } from '../..'
import { config } from '../../../config'

export class CreateJobOperation extends BaseOperation<UserOpsCtx, RunAppInput, Job> {
  private input: RunAppInput
  private jobInput: AnyObject
  private projectId: string
  private instance: typeof allowedInstanceTypes
  private readonly inputFiles: UserFile[] = []

  async run(input: RunAppInput): Promise<Job> {
    this.input = input
    this.jobInput = input.input ?? {}
    const em = this.ctx.em
    const platformClient = new client.PlatformClient(this.ctx.user.accessToken, this.ctx.log)

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

    // check snapshot file
    if (prop('snapshot', this.jobInput)) {
      // fixme: kind of weak condition, user might not own this file etc..
      const file = await em.findOne(UserFile, { uid: this.jobInput.snapshot })
      if (!file) {
        throw new errors.NotFoundError(`User file dxid: ${this.jobInput.snapshot} not found`, {
          code: errors.ErrorCodes.USER_FILE_NOT_FOUND,
        })
      }
      // inputFiles should be used as a "cache" for all file links from app inputs in future
      this.inputFiles.push(file)
    }

    if (prop('app_gz', this.jobInput)) {
      const file = await em.findOne(UserFile, { uid: this.jobInput.app_gz })
      if (!file) {
        throw new errors.NotFoundError(`User file dxid: ${this.jobInput.app_gz} not found`, {
          code: errors.ErrorCodes.USER_FILE_NOT_FOUND,
        })
      }
      this.inputFiles.push(file)
    }

    this.projectId = userHelper.getProjectToRunApp(user)
    this.instance =
    // @ts-ignore
    this.input.instanceType && allowedInstanceTypes[this.input.instanceType]
        // @ts-ignore
        ? allowedInstanceTypes[this.input.instanceType]
        : DEFAULT_INSTANCE_TYPE

    const runInputDb = this.buildJobInput(app)
    const runDxInput = this.buildClientApiCall(app)
    const jobName = input.name ?? app.title
    // todo: more conditions, user can use the file -> could be the spaces again etc

    const repo = this.ctx.em.getRepository(Job)
    const newJobClientRes = await platformClient.jobCreate(runDxInput)
    // add all the data to the database
    await em.begin()
    let job: Job
    try {
      // @ts-ignore
      job = repo.create({
        user: em.getReference(User, this.ctx.user.id),
        app: em.getReference(App, app.id),
        dxid: newJobClientRes.id,
        state: JOB_STATE.IDLE,
        project: this.projectId,
        name: jobName,
        // will be resolved later
        describe: JSON.stringify({}),
        scope: input.scope,
        entityType: JOB_DB_ENTITY_TYPE.HTTPS,
        runData: JSON.stringify({
          run_instance_type: this.instance,
          run_inputs: runInputDb,
          run_outputs: {},
        }),
        provenance: {},
        appSeriesId: app.appSeriesId,
        uid: `${newJobClientRes.id}-1`,
      })
      // todo: create Event entry -> low priority probably
      em.persist(job)
      job.provenance = this.buildProvenance({ app, job })
      await em.flush()

      const jobFilesRepo = this.ctx.em.getRepository(UserFile)
      if (this.inputFiles.length > 0) {
        const qb = jobFilesRepo.createUserFileJobRefs(
          this.inputFiles.map(file => file.id),
          job.id,
        )
        await qb.execute()
      }
      await em.commit()
    } catch (err) {
      await em.rollback()
      this.ctx.log.error({
        error: err,
      }, 'CreateJobOperation: Error creating job')
      throw err
    }

    await createSyncJobStatusTask({ dxid: job.dxid }, this.ctx.user)
    return job
  }

  private getAppInputSpec(app: App): AppInputSpecItem[] {
    const appSpec = app.spec
    const inputSpec: AppInputSpecItem[] = prop('input_spec', JSON.parse(appSpec))
    if (!inputSpec || !Array.isArray(inputSpec)) {
      throw new errors.InternalError('Input spec is not set or it is not an array')
    }
    return inputSpec
  }

  private getInputFieldNames(app: App): string[] {
    const inputSpec = this.getAppInputSpec(app)
    const inputSpecFieldNames = inputSpec.map(spec => spec.name)
    const mandatorySpecFields = inputSpec.filter(spec => spec.optional === false)
    const inputFieldNames = Object.keys(this.jobInput)
    // these are set in endpoint payload
    const presentInputFields = intersection(inputFieldNames, inputSpecFieldNames)
    // these are required by app spec and are NOT set in the endpoint payload
    const missingMandatoryInputFields = difference(
      mandatorySpecFields.map(spec => spec.name),
      inputFieldNames,
    )

    return presentInputFields.concat(missingMandatoryInputFields)
  }

  private buildJobInput(app: App): AnyObject {
    const inputFieldNames = this.getInputFieldNames(app)
    // todo: we can validate inputs with simple pre-built validation functions
    // e.g greater than 0 for duration, max string lenght for string values etc

    // jobInput must include mandatory fields and user overrides
    const jobInput = inputFieldNames.reduce(
      (obj, key) => ({
        ...obj,
        [key]: !isNil(this.jobInput[key]) ? this.jobInput[key] : this.getDefaultSpecValue(app, key),
      }),
      {},
    )
    return jobInput
  }

  private getDefaultSpecValue(app: App, key: string): string | number {
    const inputSpec = this.getAppInputSpec(app)
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

  private buildProvenance({ app, job }: { app: App; job: Job }): Provenance {
    const initValue = { [job.dxid]: { app_dxid: app.dxid, app_id: app.id, inputs: {} } }
    const inputSpec = this.getAppInputSpec(app)
    const inputFieldNames = this.getInputFieldNames(app)

    const inputs = inputFieldNames.reduce((obj, key) => {
      const specItem = inputSpec.find(spec => spec.name === key)
      if (specItem?.class === 'file') {
        const fileUid: string = this.jobInput[key]
        const inputFile = this.inputFiles.find(f => f.uid === fileUid)
        if (!inputFile) {
          throw new errors.NotFoundError(`User file uid: ${fileUid} not found`, {
            code: errors.ErrorCodes.USER_FILE_NOT_FOUND,
          })
        }
        const newField = { [key]: inputFile.dxid }
        return {
          ...obj,
          ...newField,
        }
      }
      return obj
    }, {})
    initValue[job.dxid].inputs = inputs
    // todo: add parent files provenance?
    return initValue
  }

  // Let the worker terminate the job first, then platform if still running - to avoid race conditions
  private computeTimeoutPolicyForPlatformInMinutes(): number {
    // value in config is usually in seconds, platform needs days|hours|minutes
    return Math.ceil(Number(config.workerJobs.syncJob.staleJobsTerminateAfter) / 60) + 5;
  }

  private buildClientApiCall(app: App): client.JobCreateParams {
    // shared payload here
    const payload: client.JobCreateParams = {
      project: this.projectId,
      appId: app.dxid,
      systemRequirements: {
        '*': {
          instanceType: this.instance,
        },
      },
      timeoutPolicyByExecutable: {
        [app.dxid]: {
          '*': {
            minutes: this.computeTimeoutPolicyForPlatformInMinutes()
          },
        },
      },
      costLimit: this.input.jobLimit,
      name: this.input.name,
      input: {},
    }
    const inputSpec = this.getAppInputSpec(app)
    const inputFieldNames = this.getInputFieldNames(app)
    payload.input = inputFieldNames.reduce((obj, key) => {
      const specItem = inputSpec.find(spec => spec.name === key)
      let newField: AnyObject
      if (specItem?.class === 'file') {
        // the input provided are actually uids, not dxids
        const fileUid: string = this.jobInput[key]
        const inputFile = this.inputFiles.find(f => f.uid === fileUid)
        if (!inputFile) {
          throw new errors.NotFoundError(`User file uid: ${fileUid} not found`, {
            code: errors.ErrorCodes.USER_FILE_NOT_FOUND,
          })
        }
        newField = {
          // fixme: no default value applied here
          [key]: { $dnanexus_link: { id: inputFile.dxid, project: this.projectId } },
        }
      } else {
        newField = {
          [key]: !isNil(this.jobInput[key])
            ? this.jobInput[key]
            : this.getDefaultSpecValue(app, key),
        }
      }
      return {
        ...obj,
        ...newField,
      }
    }, {})
    return payload
  }
}
