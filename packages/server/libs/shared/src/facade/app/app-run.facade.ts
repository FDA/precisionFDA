import * as crypto from 'node:crypto'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { App } from '@shared/domain/app/app.entity'
import { APP_CLI_CODE, APP_SERVER_URL } from '@shared/domain/app/app.helper'
import { AppInputSpecItem } from '@shared/domain/app/app.input'
import { RunAppDTO } from '@shared/domain/app/dto/run-app.dto'
import { AppService } from '@shared/domain/app/services/app.service'
import { AuthService } from '@shared/domain/auth/services/auth.service'
import { CliExchangeEncryptor } from '@shared/domain/cli-exchange-token/cli-exchange-encryptor/cli-exchange-encryptor'
import { CliExchangeToken } from '@shared/domain/cli-exchange-token/cli-exchange-token.entity'
import { CliExchangeTokenService } from '@shared/domain/cli-exchange-token/services/cli-exchange-token.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { JobInput } from '@shared/domain/job/job.input'
import { JobService } from '@shared/domain/job/job.service'
import { JobRunData } from '@shared/domain/job/job.types'
import { LicenseService } from '@shared/domain/license/license.service'
import { getIdFromScopeName, getProjectDxid } from '@shared/domain/space/space.helper'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { CAN_EDIT_ROLES } from '@shared/domain/space-membership/space-membership.helper'
import { User } from '@shared/domain/user/user.entity'
import { getProjectToRunApp } from '@shared/domain/user/user.helper'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { ErrorCodes, InvalidRequestError, InvalidStateError, NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { JobCreateResponse } from '@shared/platform-client/platform-client.responses'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { SCOPE } from '@shared/types/common'
import { getPluralizedTerm } from '@shared/utils/format'
import { TimeUtils } from '@shared/utils/time.utils'
import { compareVersions } from 'compare-versions'

@Injectable()
export class AppRunFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userContext: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly appService: AppService,
    private readonly nodeService: NodeService,
    private readonly spaceMembershipService: SpaceMembershipService,
    private readonly licenseService: LicenseService,
    private readonly jobService: JobService,
    private readonly authService: AuthService,
    private readonly cliExchangeTokenService: CliExchangeTokenService,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async run(appUid: Uid<'app'>, runAppInput: RunAppDTO): Promise<{ id: Uid<'job'> }> {
    const user = await this.userContext.loadEntity()

    await this.validateAppRunInput(runAppInput, user)

    const app = await this.appService.getValidAccessibleApp(appUid)
    await this.validateAssetsLicenses(app)

    const projectDxId = await this.getRunProjectFromScope(runAppInput.scope, user)
    const inputFiles = await this.getInputFiles(runAppInput, app.spec.input_spec)

    const processedInput = await this.buildJobInput(runAppInput, app, inputFiles)

    let exchangeToken: CliExchangeToken
    if (app.spec.internet_access && app.version && compareVersions(app.version, '1.3.0') >= 0 && !app.isHTTPS()) {
      this.logger.log(`Generating CLI exchange token for app run with internet access ${app.uid}`)
      const cliKey = await this.authService.generateCliKey(TimeUtils.hoursToSeconds(24))
      const cliConfigs = {
        Key: cliKey,
        Server: new URL(config.api.railsHost).host,
        Scope: runAppInput.scope,
      }
      const salt = crypto.randomBytes(16).toString('hex')
      const encryptedKey = CliExchangeEncryptor.encrypt(JSON.stringify(cliConfigs), config.job.tokenEncryptionKey, salt)

      exchangeToken = await this.cliExchangeTokenService.createNewToken(
        encryptedKey,
        runAppInput.scope,
        salt,
        runAppInput.instanceType,
      )
      processedInput[APP_CLI_CODE] = exchangeToken.code
      processedInput[APP_SERVER_URL] = config.api.railsHost.replace(/\/$/, '')
    }

    const platformRunInput = this.jobService.buildClientApiCall(app, projectDxId, processedInput, runAppInput)

    let newJobClientRes: JobCreateResponse
    try {
      newJobClientRes = await this.platformClient.jobCreate(platformRunInput)
    } catch (e) {
      if (
        e.message ===
        'PermissionDenied (401): BillTo for this job\'s project must have the "httpsApp" feature enabled to run this executable'
      ) {
        if (platformRunInput.project !== user.privateFilesProject) {
          throw new PermissionError(
            'The Lead of this Space does not have Workstations permissions for their account, so a Workstation cannot be launched in this Space context.',
          )
        } else {
          throw new PermissionError(
            'Workstations require additional account permissions. Reach out to precisionFDA support to request this permission.',
          )
        }
      }
      if (exchangeToken) {
        await this.cliExchangeTokenService.deleteToken(exchangeToken.code)
      }
      throw e
    }

    this.logger.log(`Created new job on platform with dxid: ${newJobClientRes.id}`)
    const job = await this.em.transactional(() => {
      const runData: JobRunData = {
        run_instance_type: runAppInput.instanceType,
        run_inputs: runAppInput.inputs,
        run_outputs: {},
        output_folder_path: runAppInput.outputFolderPath,
      }
      const job = new Job(user, app)
      job.dxid = newJobClientRes.id
      job.state = JOB_STATE.IDLE
      job.project = projectDxId
      job.name = platformRunInput.name
      job.describe = null
      job.scope = runAppInput.scope
      job.entityType = app.entityType
      job.runData = runData
      job.provenance = this.jobService.buildProvenance(newJobClientRes.id, app, runAppInput.inputs)
      job.appSeriesId = app.appSeriesId
      job.uid = `${newJobClientRes.id}-1`
      job.inputFiles.add(inputFiles)
      this.em.persist(job)

      if (exchangeToken) {
        this.logger.log(`Associating CLI exchange token with job dxid: ${newJobClientRes.id}`)
        exchangeToken.dxid = newJobClientRes.id
        this.em.persist(exchangeToken)
      }
      return job
    })

    await this.mainQueueJobProducer.createSyncJobStatusTask({ dxid: job.dxid })
    return { id: job.uid }
  }

  private async buildJobInput(input: RunAppDTO, app: App, inputFiles: UserFile[]): Promise<JobInput> {
    this.logger.log(`Building job input for app run: ${app.uid}`)
    const appInputs = input.inputs
    const runInput = {}
    const inputSpec = app.spec.input_spec
    for (const spec of inputSpec) {
      if (appInputs[spec.name] === null) {
        continue
      }

      if (appInputs[spec.name] === undefined) {
        if (spec.default) {
          appInputs[spec.name] = spec.default
        } else if (spec.optional) {
          continue
        } else {
          throw new InvalidStateError(`Input "${app.uid}:${spec.name}" is required but no value provided`)
        }
      }

      if (spec.class === 'file') {
        const inputFile = inputFiles.find(f => f.uid === appInputs[spec.name])
        runInput[spec.name] = {
          $dnanexus_link: { id: inputFile.dxid, project: inputFile.project },
        }
      } else if (spec.class === 'array:file') {
        const fileUids: Uid<'file'>[] = appInputs[spec.name] as Uid<'file'>[]
        runInput[spec.name] = fileUids.map((fileUid: Uid<'file'>) => {
          const inputFile = inputFiles.find(f => f.uid === fileUid)
          return {
            $dnanexus_link: { id: inputFile.dxid, project: inputFile.project },
          }
        })
      } else {
        runInput[spec.name] = appInputs[spec.name]
      }
    }
    return runInput
  }

  private async getRunProjectFromScope(scope: SCOPE, user: User): Promise<DxId<'project'>> {
    this.logger.log(`Determining project to run app in scope: ${scope}`)
    let projectDxId: DxId<'project'>
    if (scope === 'private') {
      projectDxId = getProjectToRunApp(user) as DxId<'project'>
    } else {
      const spaceId = getIdFromScopeName(scope)
      const membership = await this.spaceMembershipService.getMembership(spaceId, this.userContext.id)
      if (!membership || !CAN_EDIT_ROLES.includes(membership.role)) {
        throw new PermissionError('Unable to execute the app in selected context.')
      }
      await this.em.populate(membership, ['spaces'])
      const space = membership.spaces.getItems().find(s => s.id === spaceId)
      projectDxId = getProjectDxid(space, membership)
    }
    return projectDxId
  }

  private async getInputFiles(input: RunAppDTO, appInputSpec: AppInputSpecItem[]): Promise<UserFile[]> {
    this.logger.log(`Retrieving input files for app run: ${input.scope}`)
    const appInputs = input.inputs
    const inputFiles: UserFile[] = []
    const notFoundFileUids: Uid<'file'>[] = []

    for (const spec of appInputSpec) {
      if (appInputs[spec.name] === undefined || appInputs[spec.name] === null) {
        continue
      }

      const fileUids: Uid<'file'>[] = []
      if (spec.name in appInputs) {
        if (spec.class === 'file') {
          fileUids.push(appInputs[spec.name] as Uid<'file'>)
        } else if (spec.class === 'array:file') {
          fileUids.push(...(appInputs[spec.name] as Uid<'file'>[]))
        } else {
          continue
        }
      }

      const foundFiles = await this.nodeService.getAccessibleEntitiesByUids(fileUids)
      if (foundFiles.length !== fileUids.length) {
        const foundFileUidsSet = new Set(foundFiles.map(f => f.uid))
        notFoundFileUids.push(...fileUids.filter(uid => !foundFileUidsSet.has(uid)))
      }
      inputFiles.push(...foundFiles)
    }

    if (notFoundFileUids.length > 0) {
      const uniqueNotFoundFileUids = Array.from(new Set(notFoundFileUids))
      throw new NotFoundError(
        `${getPluralizedTerm(uniqueNotFoundFileUids.length, 'file')} not found (${uniqueNotFoundFileUids.join(', ')})`,
        {
          code: ErrorCodes.USER_FILE_NOT_FOUND,
        },
      )
    }

    return inputFiles
  }

  private async validateAppRunInput(input: RunAppDTO, user: User): Promise<void> {
    this.logger.log('Validating app run input against user settings')
    if (input.jobLimit > user.cloudResourceSettings.job_limit) {
      throw new InvalidRequestError('Job limit exceeds maximum user setting')
    }
    // casting resources to string[] for type compatibility
    if (!(user.cloudResourceSettings.resources as string[]).includes(input.instanceType)) {
      throw new InvalidStateError('Instance type not allowed for user')
    }
  }

  private async validateAssetsLicenses(app: App): Promise<void> {
    this.logger.log('Validating asset licenses before running app')
    await this.em.populate(app, ['assets'])
    const assets = app.assets.getItems()
    const assetUids = assets.map(asset => asset.uid)
    const licenses = await this.licenseService.findLicensedItemsByNodeUids(assetUids)
    if (licenses.length > 0) {
      await this.em.populate(licenses, ['acceptedLicenses'], {
        where: {
          acceptedLicenses: { user: this.userContext.id },
        },
      })
      for (const license of licenses) {
        if (license.acceptedLicenses.getItems().length === 0) {
          throw new PermissionError(`Asset license "${license.title}" must be accepted before running this app`)
        }
      }
    }
  }
}
