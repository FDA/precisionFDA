import { Collection, Reference, SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { App } from '@shared/domain/app/app.entity'
import { APP_CLI_CODE, APP_SERVER_URL, APPKIT_LATEST_VERSION } from '@shared/domain/app/app.helper'
import { RunAppDTO } from '@shared/domain/app/dto/run-app.dto'
import { AppService } from '@shared/domain/app/services/app.service'
import { AuthService } from '@shared/domain/auth/services/auth.service'
import { CliExchangeToken } from '@shared/domain/cli-exchange-token/cli-exchange-token.entity'
import { CliExchangeTokenService } from '@shared/domain/cli-exchange-token/services/cli-exchange-token.service'
import { Job } from '@shared/domain/job/job.entity'
import { JobService } from '@shared/domain/job/job.service'
import { LicenseService } from '@shared/domain/license/license.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { InvalidRequestError, InvalidStateError, NotFoundError, PermissionError } from '@shared/errors'
import { AppRunFacade } from '@shared/facade/app/app-run.facade'
import { PlatformClient } from '@shared/platform-client'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { TimeUtils } from '@shared/utils/time.utils'

describe('AppRunFacade tests', () => {
  const populateStub = stub()
  const getValidAccessibleAppStub = stub()
  const findLicensedItemsByNodeUidsStub = stub()
  const getMembershipStub = stub()
  const getAccessibleEntitiesByUidsStub = stub()
  const generateCliKeyStub = stub()
  const jobCreateStub = stub()
  const buildClientApiCallStub = stub()
  const buildProvenanceStub = stub()
  const transactionalStub = stub()
  const persistStub = stub()
  let referenceStub: sinon.SinonStub
  let collectionAddStub: sinon.SinonStub
  const createSyncJobStatusTaskStub = stub()
  const createNewTokenStub = stub()
  const deleteTokenStub = stub()

  const USER_JOB_LIMIT = 100
  const USER = {
    id: 1,
    dxuser: 'test.user',
    cloudResourceSettings: {
      job_limit: USER_JOB_LIMIT,
      resources: ['baseline-2', 'baseline-4', 'hidisk-2', 'hidisk-4', 'himem-2', 'himem-4'],
    },
    privateFilesProject: 'project-userprivatefiles',
  } as unknown as User
  const VIEWER = {
    id: 2,
    dxuser: 'viewer.user',
    cloudResourceSettings: {
      job_limit: USER_JOB_LIMIT,
      resources: ['baseline-2', 'baseline-4', 'hidisk-2', 'hidisk-4', 'himem-2', 'himem-4'],
    },
    privateFilesProject: 'project-viewerprivatefiles',
  } as unknown as User

  const APP_UID = 'app-1234567890abcdef12345678-1'
  const APP = {
    id: 1,
    name: 'Test App',
    uid: APP_UID,
    assets: {
      getItems: (): Asset[] => {
        return []
      },
    },
    spec: {
      input_spec: [
        {
          name: 'file_input',
          class: 'file',
          optional: false,
        },
        {
          name: 'file_array_input',
          class: 'array:file',
          optional: true,
        },
        {
          name: 'default_text_input',
          class: 'string',
          optional: true,
          default: 'default value',
        },
      ],
    },
    scope: 'public',
  } as unknown as App
  const APP_WITH_CLI_UID = 'app-clisetup1234567890abcdef-1'
  const APP_WITH_CLI = {
    id: 2,
    name: 'Test App with CLI',
    uid: APP_WITH_CLI_UID,
    assets: {
      getItems: (): Asset[] => {
        return []
      },
    },
    version: APPKIT_LATEST_VERSION,
    isHTTPS: (): boolean => false,
    spec: {
      internet_access: true,
      input_spec: [
        {
          name: 'file_input',
          class: 'file',
          optional: false,
        },
      ],
    },
    scope: 'public',
  } as unknown as App
  const APP_WITH_ASSETS_UID = 'app-withassets1234567890abcdef-1'
  const ASSET_1 = {
    id: 1,
    uid: 'file-asset-1',
  } as unknown as Asset
  const ASSET_2 = {
    id: 2,
    uid: 'file-asset-2',
  } as unknown as Asset
  const ASSETS = [ASSET_1, ASSET_2] as Asset[]
  const APP_WITH_ASSETS = {
    id: 2,
    uid: APP_WITH_ASSETS_UID,
    name: 'Test App with Assets',
    assets: {
      getItems: (): Asset[] => {
        return ASSETS
      },
    },
  }
  const LICENSE = {
    id: 1,
    title: 'Test Asset License',
    acceptedLicenses: {
      getItems: (): string[] => {
        return []
      },
    },
  }

  const SPACE = {
    id: 1,
    hostProject: 'project-host',
    guestProject: 'project-guest',
  } as unknown as Space
  const MEMBERSHIP = {
    id: 1,
    role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
    spaces: {
      getItems: (): Space[] => {
        return [SPACE]
      },
    },
    isHost: (): boolean => true,
    user: USER,
  }
  const VIEWER_MEMBERSHIP = {
    id: 2,
    role: SPACE_MEMBERSHIP_ROLE.VIEWER,
    spaces: {
      getItems: (): Space[] => {
        return [SPACE]
      },
    },
    isHost: (): boolean => true,
    user: VIEWER,
  }

  const PRIVATE_FILE = {
    id: 1,
    dxid: 'file-inputprivate',
    uid: 'file-inputprivate-1',
    project: USER.privateFilesProject,
    scope: 'private',
  } as unknown as UserFile
  const SPACE_FILE = {
    id: 2,
    dxid: 'file-inputspace',
    uid: 'file-inputspace-1',
    project: SPACE.hostProject,
    scope: `space-${SPACE.id}`,
  } as unknown as UserFile

  const PRIVATE_JOB = {
    id: 1,
    dxid: 'job-private',
    uid: 'job-private-1',
    scope: 'private',
  } as unknown as Job
  const SPACE_JOB = {
    id: 2,
    dxid: 'job-space',
    uid: 'job-space-1',
    scope: `space-${SPACE.id}`,
  } as unknown as Job

  const CLI_KEY = 'cli-key'
  const EXCHANGE_TOKEN = {
    code: 'exchange-token-code',
  } as unknown as CliExchangeToken

  const em = {
    populate: populateStub,
    transactional: transactionalStub,
    persist: persistStub,
  } as unknown as SqlEntityManager
  const defaultUserContext = {
    id: USER.id,
    dxuser: USER.dxuser,
    async loadEntity(): Promise<User> {
      return USER
    },
  } as unknown as UserContext
  const viewerUserContext = {
    id: VIEWER.id,
    dxuser: VIEWER.dxuser,
    async loadEntity(): Promise<User> {
      return VIEWER as unknown as User
    },
  } as unknown as UserContext
  const platformClient = {
    jobCreate: jobCreateStub,
  } as unknown as PlatformClient
  const appService = {
    getValidAccessibleApp: getValidAccessibleAppStub,
  } as unknown as AppService
  const nodeService = {
    getAccessibleEntitiesByUids: getAccessibleEntitiesByUidsStub,
  } as unknown as NodeService
  const spaceMembershipService = {
    getMembership: getMembershipStub,
  } as unknown as SpaceMembershipService
  const licenseService = {
    findLicensedItemsByNodeUids: findLicensedItemsByNodeUidsStub,
  } as unknown as LicenseService
  const jobService = {
    buildClientApiCall: buildClientApiCallStub,
    buildProvenance: buildProvenanceStub,
  } as unknown as JobService
  const authService = {
    generateCliKey: generateCliKeyStub,
  } as unknown as AuthService
  const cliExchangeTokenService = {
    createNewToken: createNewTokenStub,
    deleteToken: deleteTokenStub,
  } as unknown as CliExchangeTokenService
  const mainQueueJobProducer = {
    createSyncJobStatusTask: createSyncJobStatusTaskStub,
  } as unknown as MainQueueJobProducer

  beforeEach(() => {
    populateStub.reset()
    populateStub.throws()
    populateStub.resolves()

    getValidAccessibleAppStub.reset()
    getValidAccessibleAppStub.throws()
    getValidAccessibleAppStub
      .withArgs(APP_UID)
      .resolves(APP)
      .withArgs(APP_WITH_ASSETS_UID)
      .resolves(APP_WITH_ASSETS)
      .withArgs(APP_WITH_CLI_UID)
      .resolves(APP_WITH_CLI)

    findLicensedItemsByNodeUidsStub.reset()
    findLicensedItemsByNodeUidsStub.throws()
    findLicensedItemsByNodeUidsStub.withArgs([]).resolves([])
    findLicensedItemsByNodeUidsStub.withArgs([ASSET_1.uid, ASSET_2.uid]).resolves([LICENSE])

    getMembershipStub.reset()
    getMembershipStub.throws()
    getMembershipStub.withArgs(SPACE.id, USER.id).resolves(MEMBERSHIP)
    getMembershipStub.withArgs(SPACE.id, VIEWER.id).resolves(VIEWER_MEMBERSHIP)

    getAccessibleEntitiesByUidsStub.reset()
    getAccessibleEntitiesByUidsStub.throws()
    getAccessibleEntitiesByUidsStub.resolves([])
    getAccessibleEntitiesByUidsStub.withArgs([PRIVATE_FILE.uid]).resolves([PRIVATE_FILE])
    getAccessibleEntitiesByUidsStub.withArgs([SPACE_FILE.uid]).resolves([SPACE_FILE])

    generateCliKeyStub.reset()
    generateCliKeyStub.throws()
    generateCliKeyStub.resolves(CLI_KEY)

    jobCreateStub.reset()
    jobCreateStub.throws()

    buildClientApiCallStub.reset()
    buildClientApiCallStub.throws()
    buildClientApiCallStub.returns({})
    buildProvenanceStub.reset()
    buildProvenanceStub.throws()
    buildProvenanceStub.returns({})

    transactionalStub.reset()
    transactionalStub.throws()
    transactionalStub.callsFake(async callback => {
      return await callback(em)
    })

    persistStub.reset()
    persistStub.throws()
    persistStub.returns(undefined)

    referenceStub = stub(Reference, 'create')
    referenceStub.withArgs(APP).returns(APP as unknown as Reference<App>)
    referenceStub.withArgs(USER).returns(USER as unknown as Reference<User>)

    collectionAddStub = stub(Collection.prototype, 'add')

    createNewTokenStub.reset()
    createNewTokenStub.throws()
    createNewTokenStub.resolves(EXCHANGE_TOKEN)
    deleteTokenStub.reset()
    deleteTokenStub.throws()
    deleteTokenStub.resolves()

    createSyncJobStatusTaskStub.reset()
    createSyncJobStatusTaskStub.throws()
    createSyncJobStatusTaskStub.resolves()
  })

  afterEach(() => {
    referenceStub.restore()
    collectionAddStub.restore()
  })

  it('throws InvalidRequestError if job limit is exceeded', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT + 1

    await expect(facade.run(APP_UID, runAppDTO)).to.be.rejectedWith(
      InvalidRequestError,
      'Job limit exceeds maximum user setting',
    )
  })

  it('throws InvalidStateError if instance type is invalid', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.instanceType = 'invalid-instance-type'

    await expect(facade.run(APP_UID, runAppDTO)).to.be.rejectedWith(
      InvalidStateError,
      'Instance type not allowed for user',
    )
  })

  it('throws NotFoundError if app is not found', async () => {
    const nonExistentAppUid = 'app-nonexistent-1'
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'

    getValidAccessibleAppStub
      .withArgs(nonExistentAppUid)
      .throws(new NotFoundError(`App with ID ${nonExistentAppUid} not found or inaccessible`))

    await expect(facade.run(nonExistentAppUid, runAppDTO)).to.be.rejectedWith(
      NotFoundError,
      `App with ID ${nonExistentAppUid} not found or inaccessible`,
    )
  })

  it('throws InvalidStateError if app has been invalidated', async () => {
    const invalidAppUid = 'app-invalidate-1'
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'

    getValidAccessibleAppStub
      .withArgs(invalidAppUid)
      .throws(new InvalidStateError(`App with ID ${invalidAppUid} has been invalidated`))

    await expect(facade.run(invalidAppUid, runAppDTO)).to.be.rejectedWith(
      InvalidStateError,
      `App with ID ${invalidAppUid} has been invalidated`,
    )
  })

  it('check assets licenses and throws PermissionError if licenses are not accepted', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'

    await expect(facade.run(APP_WITH_ASSETS_UID, runAppDTO)).to.be.rejectedWith(
      PermissionError,
      `Asset license "${LICENSE.title}" must be accepted before running this app`,
    )
    expect(populateStub.calledTwice).to.be.true()
    expect(populateStub.firstCall.args[0]).to.deep.equal(APP_WITH_ASSETS)
    expect(populateStub.firstCall.args[1]).to.deep.equal(['assets'])
    expect(populateStub.secondCall.args[0]).to.deep.equal([LICENSE])
    expect(populateStub.secondCall.args[1]).to.deep.equal(['acceptedLicenses'])
  })

  it('throws PermissionError if user is not member of space in the scope', async () => {
    const spaceId = 9999
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.scope = `space-${spaceId}`

    getMembershipStub.withArgs(spaceId, USER.id).resolves(null)

    await expect(facade.run(APP_UID, runAppDTO)).to.be.rejectedWith(
      PermissionError,
      'Unable to execute the app in selected context.',
    )
  })

  it('throws PermissionError if user is not allowed to run app within the context', async () => {
    const facade = getInstance(viewerUserContext)
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.scope = `space-${SPACE.id}`

    await expect(facade.run(APP_UID, runAppDTO)).to.be.rejectedWith(
      PermissionError,
      'Unable to execute the app in selected context.',
    )
  })

  it('throws NotFoundError if input files are not found', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    const notExistentFileUid = 'file-nonexistent-1'
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.inputs = {
      file_input: notExistentFileUid,
    }
    runAppDTO.scope = 'private'

    getAccessibleEntitiesByUidsStub.withArgs([notExistentFileUid]).resolves([])

    await expect(facade.run(APP_UID, runAppDTO)).to.be.rejectedWith(
      NotFoundError,
      `1 file not found (${notExistentFileUid})`,
    )
  })

  it('throws InvalidStateError if input is not provided for a non-optional input spec', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.inputs = {
      file_array_input: [PRIVATE_FILE.uid],
    }
    runAppDTO.scope = 'private'

    await expect(facade.run(APP_UID, runAppDTO)).to.be.rejectedWith(
      InvalidStateError,
      `Input "${APP_UID}:file_input" is required but no value provided`,
    )
  })

  it('throws lead space PermissionError if lead does not have workstations permissions', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.inputs = {
      file_input: SPACE_FILE.uid,
    }
    runAppDTO.scope = `space-${SPACE.id}`

    jobCreateStub.throws(
      new Error(
        'PermissionDenied (401): BillTo for this job\'s project must have the "httpsApp" feature enabled to run this executable',
      ),
    )

    await expect(facade.run(APP_UID, runAppDTO)).to.be.rejectedWith(
      PermissionError,
      'The Lead of this Space does not have Workstations permissions for their account, so a Workstation cannot be launched in this Space context.',
    )
  })

  it('throws workstations PermissionError if user does not have workstations permissions', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.inputs = {
      file_input: PRIVATE_FILE.uid,
    }
    runAppDTO.scope = 'private'

    buildClientApiCallStub.reset()
    buildClientApiCallStub.returns({
      project: USER.privateFilesProject,
    })
    jobCreateStub.throws(
      new Error(
        'PermissionDenied (401): BillTo for this job\'s project must have the "httpsApp" feature enabled to run this executable',
      ),
    )

    await expect(facade.run(APP_UID, runAppDTO)).to.be.rejectedWith(
      PermissionError,
      'Workstations require additional account permissions. Reach out to precisionFDA support to request this permission.',
    )
  })

  it('throws platform error if platform job creation fails', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.inputs = {
      file_input: PRIVATE_FILE.uid,
    }
    runAppDTO.scope = 'private'

    jobCreateStub.throws(new Error('InvalidState'))

    await expect(facade.run(APP_UID, runAppDTO)).to.be.rejectedWith(Error, 'InvalidState')
  })

  it('successfully runs app with valid inputs in private scope', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.inputs = {
      file_input: PRIVATE_FILE.uid,
      file_array_input: [PRIVATE_FILE.uid],
    }
    runAppDTO.scope = 'private'

    transactionalStub.callsFake(async callback => {
      await callback(em)
      return PRIVATE_JOB
    })
    jobCreateStub.resolves({
      id: PRIVATE_JOB.dxid,
    })

    const job = await facade.run(APP_UID, runAppDTO)
    expect(job).to.deep.equal({ id: PRIVATE_JOB.uid })
    expect(getValidAccessibleAppStub.calledOnceWithExactly(APP_UID)).to.be.true()
    expect(populateStub.calledOnce).to.be.true()
    expect(populateStub.firstCall.args[0]).to.deep.equal(APP)
    expect(populateStub.firstCall.args[1]).to.deep.equal(['assets'])
    expect(getAccessibleEntitiesByUidsStub.calledTwice).to.be.true()
    expect(getAccessibleEntitiesByUidsStub.firstCall.args[0]).to.deep.equal([PRIVATE_FILE.uid])
    expect(getAccessibleEntitiesByUidsStub.secondCall.args[0]).to.deep.equal([PRIVATE_FILE.uid])
    expect(buildClientApiCallStub.calledOnce).to.be.true()
    expect(buildClientApiCallStub.firstCall.args[0]).to.deep.equal(APP)
    expect(buildClientApiCallStub.firstCall.args[1]).to.equal(USER.privateFilesProject)
    expect(buildClientApiCallStub.firstCall.args[2].file_input).to.deep.equal({
      $dnanexus_link: { id: PRIVATE_FILE.dxid, project: PRIVATE_FILE.project },
    })
    expect(buildClientApiCallStub.firstCall.args[2].file_array_input).to.deep.equal([
      { $dnanexus_link: { id: PRIVATE_FILE.dxid, project: PRIVATE_FILE.project } },
    ])
    expect(buildClientApiCallStub.firstCall.args[2].default_text_input).to.equal('default value')
    expect(buildClientApiCallStub.firstCall.args[3]).to.equal(runAppDTO)
    expect(jobCreateStub.calledOnce).to.be.true()
    expect(jobCreateStub.firstCall.args[0]).to.deep.equal({})
    expect(transactionalStub.calledOnce).to.be.true()
    expect(buildProvenanceStub.calledOnce).to.be.true()
    expect(buildProvenanceStub.firstCall.args[0]).to.equal(PRIVATE_JOB.dxid)
    expect(buildProvenanceStub.firstCall.args[1]).to.deep.equal(APP)
    expect(buildProvenanceStub.firstCall.args[2]).to.deep.equal(runAppDTO.inputs)
    expect(createSyncJobStatusTaskStub.calledOnceWithExactly({ dxid: PRIVATE_JOB.dxid })).to.be.true()
  })

  it('successfully runs app with valid inputs in space scope', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.inputs = {
      file_input: SPACE_FILE.uid,
      file_array_input: [SPACE_FILE.uid],
      default_text_input: 'custom value',
    }
    runAppDTO.scope = `space-${SPACE.id}`

    transactionalStub.callsFake(async callback => {
      await callback(em)
      return SPACE_JOB
    })
    jobCreateStub.resolves({
      id: SPACE_JOB.dxid,
    })

    const job = await facade.run(APP_UID, runAppDTO)
    expect(job).to.deep.equal({ id: SPACE_JOB.uid })
    expect(getValidAccessibleAppStub.calledOnceWithExactly(APP_UID)).to.be.true()
    expect(populateStub.calledTwice).to.be.true()
    expect(populateStub.firstCall.args[0]).to.deep.equal(APP)
    expect(populateStub.firstCall.args[1]).to.deep.equal(['assets'])
    expect(populateStub.secondCall.args[0]).to.deep.equal(MEMBERSHIP)
    expect(populateStub.secondCall.args[1]).to.deep.equal(['spaces'])
    expect(getAccessibleEntitiesByUidsStub.calledTwice).to.be.true()
    expect(getAccessibleEntitiesByUidsStub.firstCall.args[0]).to.deep.equal([SPACE_FILE.uid])
    expect(getAccessibleEntitiesByUidsStub.secondCall.args[0]).to.deep.equal([SPACE_FILE.uid])
    expect(buildClientApiCallStub.calledOnce).to.be.true()
    expect(buildClientApiCallStub.firstCall.args[0]).to.deep.equal(APP)
    expect(buildClientApiCallStub.firstCall.args[1]).to.equal(SPACE.hostProject)
    expect(buildClientApiCallStub.firstCall.args[2]).to.deep.equal({
      file_input: { $dnanexus_link: { id: SPACE_FILE.dxid, project: SPACE_FILE.project } },
      file_array_input: [{ $dnanexus_link: { id: SPACE_FILE.dxid, project: SPACE_FILE.project } }],
      default_text_input: 'custom value',
    })
    expect(buildClientApiCallStub.firstCall.args[3]).to.equal(runAppDTO)
    expect(jobCreateStub.calledOnce).to.be.true()
    expect(jobCreateStub.firstCall.args[0]).to.deep.equal({})
    expect(transactionalStub.calledOnce).to.be.true()
    expect(buildProvenanceStub.calledOnce).to.be.true()
    expect(buildProvenanceStub.firstCall.args[0]).to.equal(SPACE_JOB.dxid)
    expect(buildProvenanceStub.firstCall.args[1]).to.deep.equal(APP)
    expect(buildProvenanceStub.firstCall.args[2]).to.deep.equal(runAppDTO.inputs)
    expect(createSyncJobStatusTaskStub.calledOnceWithExactly({ dxid: SPACE_JOB.dxid })).to.be.true()
  })

  it('create CLI exchange token and send the input if app supports CLI setting', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.inputs = {
      file_input: PRIVATE_FILE.uid,
    }
    runAppDTO.scope = STATIC_SCOPE.PRIVATE
    transactionalStub.callsFake(async callback => {
      await callback(em)
      return PRIVATE_JOB
    })
    jobCreateStub.resolves({
      id: PRIVATE_JOB.dxid,
    })

    const job = await facade.run(APP_WITH_CLI_UID, runAppDTO)
    expect(job).to.deep.equal({ id: PRIVATE_JOB.uid })
    expect(getValidAccessibleAppStub.calledOnceWithExactly(APP_WITH_CLI_UID)).to.be.true()
    expect(populateStub.calledOnce).to.be.true()
    expect(populateStub.firstCall.args[0]).to.deep.equal(APP_WITH_CLI)
    expect(populateStub.firstCall.args[1]).to.deep.equal(['assets'])
    expect(getAccessibleEntitiesByUidsStub.calledOnce).to.be.true()
    expect(getAccessibleEntitiesByUidsStub.firstCall.args[0]).to.deep.equal([PRIVATE_FILE.uid])
    expect(generateCliKeyStub.calledOnceWithExactly(TimeUtils.hoursToSeconds(24))).to.be.true()
    expect(createNewTokenStub.calledOnce).to.be.true()
    expect(createNewTokenStub.firstCall.args[1]).to.deep.equal(runAppDTO.scope)
    expect(buildClientApiCallStub.calledOnce).to.be.true()
    expect(buildClientApiCallStub.firstCall.args[0]).to.deep.equal(APP_WITH_CLI)
    expect(buildClientApiCallStub.firstCall.args[1]).to.equal(PRIVATE_FILE.project)
    expect(buildClientApiCallStub.firstCall.args[2]).to.deep.equal({
      [APP_CLI_CODE]: EXCHANGE_TOKEN.code,
      [APP_SERVER_URL]: config.api.railsHost.replace(/\/$/, ''),
      file_input: { $dnanexus_link: { id: PRIVATE_FILE.dxid, project: PRIVATE_FILE.project } },
    })
    expect(buildClientApiCallStub.firstCall.args[3]).to.equal(runAppDTO)
    expect(jobCreateStub.calledOnce).to.be.true()
    expect(jobCreateStub.firstCall.args[0]).to.deep.equal({})
    expect(transactionalStub.calledOnce).to.be.true()
    expect(buildProvenanceStub.calledOnce).to.be.true()
    expect(buildProvenanceStub.firstCall.args[0]).to.equal(PRIVATE_JOB.dxid)
    expect(buildProvenanceStub.firstCall.args[1]).to.deep.equal(APP_WITH_CLI)
    expect(buildProvenanceStub.firstCall.args[2]).to.deep.equal(runAppDTO.inputs)
    expect(createSyncJobStatusTaskStub.calledOnceWithExactly({ dxid: PRIVATE_JOB.dxid })).to.be.true()
  })

  it('delete CLI exchange token if job creation fails', async () => {
    const facade = getInstance()
    const runAppDTO = new RunAppDTO()
    runAppDTO.jobLimit = USER_JOB_LIMIT
    runAppDTO.instanceType = 'baseline-2'
    runAppDTO.inputs = {
      file_input: PRIVATE_FILE.uid,
    }
    runAppDTO.scope = STATIC_SCOPE.PRIVATE

    generateCliKeyStub.resolves(CLI_KEY)
    createNewTokenStub.resolves(EXCHANGE_TOKEN)
    jobCreateStub.throws(
      new PermissionError(
        'Workstations require additional account permissions. Reach out to precisionFDA support to request this permission.',
      ),
    )

    await expect(facade.run(APP_WITH_CLI_UID, runAppDTO)).to.be.rejectedWith(
      PermissionError,
      'Workstations require additional account permissions. Reach out to precisionFDA support to request this permission.',
    )
    expect(createNewTokenStub.calledOnce).to.be.true()
    expect(deleteTokenStub.calledOnceWithExactly(EXCHANGE_TOKEN.code)).to.be.true()
  })

  function getInstance(userContext: UserContext = defaultUserContext): AppRunFacade {
    return new AppRunFacade(
      em,
      userContext,
      platformClient,
      appService,
      nodeService,
      spaceMembershipService,
      licenseService,
      jobService,
      authService,
      cliExchangeTokenService,
      mainQueueJobProducer,
    )
  }
})
