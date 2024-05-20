import { App } from '@shared/domain/app/app.entity'
import { JobRunData } from '@shared/domain/job/job.types'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { getProjectToRunApp } from '@shared/domain/user/user.helper'
import { PlatformClient } from '@shared/platform-client'
import { JobCreateParams } from '@shared/platform-client/platform-client.params'
import { difference, intersection, isNil, prop } from 'ramda'
import * as errors from '../../../errors'
import type { RunAppInput, Provenance } from '../job.input'
import { BaseOperation } from '@shared/utils/base-operation'
import { Job } from '../job.entity'
import {
  JOB_STATE,
  allowedInstanceTypes,
  JOB_DB_ENTITY_TYPE,
  DEFAULT_INSTANCE_TYPE,
} from '../job.enum'
import { createSyncJobStatusTask } from '../../../queue'
import { AppInputSpecItem } from '../../app/app.enum'
import { AnyObject, UserOpsCtx } from '../../../types'
import { config } from '../../../config'
import { getIdFromScopeName, getProjectDxid } from '../../space/space.helper'
import { MAX_PLATFORM_ALLOWED_TIMEOUT_SECONDS } from '../../../config/constants'
import { getPluralizedTerm } from '@shared/utils/format'

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
    const platformClient = new PlatformClient(
      { accessToken: this.ctx.user.accessToken },
      this.ctx.log,
    )

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

    const inputSpec = this.getAppInputSpec(app)
    const mappingClass: AnyObject = {}
    for (const spec of inputSpec) {
      if (spec.name in this.jobInput) {
        let files: any[] = []
        if (spec.class === 'file') {
          mappingClass[spec.name] = 'file'
          files = [this.jobInput[spec.name]]
        } else if (spec.class === 'array:file') {
          mappingClass[spec.name] = 'array:file'
          files = this.jobInput[spec.name]
        }
        if (files.length) {
          const inputFiles = await em.find(UserFile, { uid: { $in: files } })
          if (inputFiles.length !== files.length) {
            const foundFiles = inputFiles.map(f => f.uid)
            throw new errors.NotFoundError(`${getPluralizedTerm(files.length, 'file')} in input but found ${inputFiles.length}: ${foundFiles}`, {
              code: errors.ErrorCodes.USER_FILE_NOT_FOUND,
            })
          }
          this.inputFiles.push(...inputFiles)
        }
      }
    }

    if (input.scope === 'private') {
      this.projectId = getProjectToRunApp(user)
    } else {
      let spaceId = getIdFromScopeName(input.scope)
      const space = await em.findOne(Space, {id: spaceId})
      const membership = await em.findOne(SpaceMembership, {spaces: spaceId, user: user})
      if (space == null || membership == null){
        throw new errors.PermissionError("Unable to execute the app in selected context.",{
          statusCode: 401
        })
      }
      this.projectId = getProjectDxid(space, membership)
    }
    // @ts-ignore
    this.instance = allowedInstanceTypes[this.input.instanceType] ?? DEFAULT_INSTANCE_TYPE
    const runInputDb = this.buildJobInput(app)
    const runDxInput = this.buildClientApiCall(app, runInputDb, mappingClass)
    const jobName = input.name ?? app.title
    // todo: more conditions, user can use the file -> could be the spaces again etc

    const repo = this.ctx.em.getRepository(Job)
    const newJobClientRes = await platformClient.jobCreate(runDxInput)
    // add all the data to the database
    await em.begin()
    let job: Job
    const runData: JobRunData = {
      run_instance_type: this.input.instanceType,
      run_inputs: runInputDb,
      run_outputs: {},
    }
    if (this.input.output_folder_path?.length) {
      runData.output_folder_path = this.input.output_folder_path
    }
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
        runData,
        provenance: {},
        appSeriesId: app.appSeriesId,
        uid: `${newJobClientRes.id}-1`,
      })
      // todo: create Event entry -> low priority probably
      em.persist(job)
      job.provenance = this.buildProvenance({ app, job })
      job.inputFiles.add(this.inputFiles)

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
    const inputSpec: AppInputSpecItem[] = app.spec.input_spec.map(
      spec => {
        const appInputSpec: AppInputSpecItem = {
          name: spec.name,
          // @ts-ignore
          class: spec.class,
          // @ts-ignore
          default: spec.default,
          label: spec.label,
          help: spec.help,
          optional: spec.optional,
        }
        return appInputSpec
      },
    )
    if (!inputSpec || !Array.isArray(inputSpec)) {
      throw new errors.InternalError('Input spec is not set or it is not an array')
    }
    return inputSpec
  }

  private getInputFieldNames(app: App): string[] {
    const inputSpec = this.getAppInputSpec(app)
    const inputSpecFieldNames = inputSpec.map(spec => spec.name)
    const mandatorySpecFields = inputSpec.filter(spec => !spec.optional)
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

  // Let the worker terminate the job first, then let platform do it (with 5 minutes delay)
  private computeTimeoutPolicyForPlatformInMinutes(): number {
    // value in config is in seconds, platform needs days|hours|minutes
    const platformTimeoutInMinutes = Math.ceil(Number(config.workerJobs.syncJob.staleJobsTerminateAfter) / 60) + 5
    const maxPlatformAllowedTimeoutInMinutes =  Math.ceil(MAX_PLATFORM_ALLOWED_TIMEOUT_SECONDS / 60)

    return Math.min(platformTimeoutInMinutes, maxPlatformAllowedTimeoutInMinutes)
  }

  private buildClientApiCall(app: App, jobInput: AnyObject, mappingClass: AnyObject): JobCreateParams {
    // shared payload here
    const payload: JobCreateParams = {
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
      input: {...jobInput},
    }
    for (const field in mappingClass) {
      if (mappingClass[field] === 'file') {
        const inputFile = this.inputFiles.find(f => f.uid === this.jobInput[field])
        payload.input[field] = {
          $dnanexus_link: { id: inputFile.dxid, project: inputFile.project }
        }
      } else {
        payload.input[field] = this.jobInput[field].map((fileUid: string) => {
          const inputFile = this.inputFiles.find(f => f.uid === fileUid)
          return {
            $dnanexus_link: { id: inputFile.dxid, project: inputFile.project }
          }
        })
      }
    }
    return payload
  }
}
