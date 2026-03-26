import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { JobCountService } from '@shared/domain/job/services/job-count.service'
import { Queue } from 'bull'
import { expect } from 'chai'
import { stub, SinonStub } from 'sinon'
import { database } from '@shared/database'
import { EmailService } from '@shared/domain/email/email.service'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { JobSetAPIKeyBodyDTO } from '@shared/domain/job/dto/job-set-api-key-body.dto'
import { JobRepository } from '@shared/domain/job/job.repository'
import { JobService } from '@shared/domain/job/job.service'
import { JobRunData } from '@shared/domain/job/job.types'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { JobWorkstationService } from '@shared/domain/job/services/job-workstation.service'
import { Notification } from '@shared/domain/notification/notification.entity'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '@shared/enums'
import { InvalidStateError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { FileStatesParams, JobFindParams } from '@shared/platform-client/platform-client.params'
import {
  FileStateResult,
  FindJobsResponse,
  JobDescribeResponse,
  JobOutput,
} from '@shared/platform-client/platform-client.responses'
import * as queueDomain from '@shared/queue'
import { create, db } from '@shared/test'

describe('Job service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let jobService: JobService
  let userCtx: UserContext
  let notificationService: NotificationService
  let nodeService: NodeService
  let jobSynchronizationService: JobSynchronizationService
  let jobRepo: JobRepository
  let spaceRepo: SpaceRepository
  let spaceMembershipRepo: SpaceMembershipRepository
  let emailService: EmailService
  let eventHelper: EventHelper
  let jobWorkstationService: JobWorkstationService

  let getMainQueueStub: SinonStub
  const userContextLoadEntityStub = stub()
  const userRepoFindOneOrFailStub = stub()
  const userRepoFindAdminUserStub = stub()
  const jobRepoFindOneOrFailStub = stub()
  const jobRepoFindStub = stub()
  const spaceMembershipRepoGetMembershipStub = stub()
  const spaceRepoFindOneStub = stub()
  const eventHelperCreateFileEventStub = stub()
  const nodeServiceCreateFoldersOnPathStub = stub()
  const aliveStub = stub()
  const setAPIKeyStub = stub()
  const snapshotStub = stub()

  const file1Dxid = 'file-GY5q9B00Q6xpbXG503kKgF68'
  const file2Dxid = 'file-GXPKG480q0jQPgXxFxKyyJ7q'
  const file3Dxid = 'file-GXgzZ7j00k4KVKfBzFyq8YXx'
  const userId = 100

  const queueAdd = stub()
  const queue = {
    add: queueAdd,
    getJob: () => {},
  } as unknown as Queue

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em, { id: userId })
    await em.flush()
    userCtx = {
      dxuser: 'dxuser',
      accessToken: '',
      id: user.id,
      loadEntity: userContextLoadEntityStub,
    } as UserContext

    notificationService = new NotificationService(em, userCtx)
    nodeService = {
      createFoldersOnPath: nodeServiceCreateFoldersOnPathStub,
    } as unknown as NodeService
    eventHelper = {
      createFileEvent: eventHelperCreateFileEventStub,
    } as unknown as EventHelper
    jobSynchronizationService = {} as unknown as JobSynchronizationService
    jobRepo = {
      findOneOrFail: jobRepoFindOneOrFailStub,
      find: jobRepoFindStub,
    } as unknown as JobRepository
    spaceRepo = {
      findOne: spaceRepoFindOneStub,
    } as unknown as SpaceRepository
    spaceMembershipRepo = {
      getMembership: spaceMembershipRepoGetMembershipStub,
    } as unknown as SpaceMembershipRepository

    emailService = {} as unknown as EmailService
    jobWorkstationService = {
      alive: aliveStub,
      setAPIKey: setAPIKeyStub,
      snapshot: snapshotStub,
    } as unknown as JobWorkstationService

    queueAdd.reset()
    queueAdd.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()

    userContextLoadEntityStub.reset()
    userContextLoadEntityStub.throws()

    jobRepoFindOneOrFailStub.reset()
    jobRepoFindOneOrFailStub.throws()

    spaceMembershipRepoGetMembershipStub.reset()
    spaceMembershipRepoGetMembershipStub.throws()

    spaceRepoFindOneStub.reset()
    spaceRepoFindOneStub.throws()

    userRepoFindAdminUserStub.reset()
    userRepoFindAdminUserStub.throws()

    jobRepoFindStub.reset()
    jobRepoFindStub.throws()

    eventHelperCreateFileEventStub.reset()
    eventHelperCreateFileEventStub.throws()

    aliveStub.reset()
    aliveStub.throws()
    aliveStub.resolves(true)

    setAPIKeyStub.reset()
    setAPIKeyStub.throws()
    setAPIKeyStub.resolves()

    snapshotStub.reset()
    snapshotStub.throws()
    snapshotStub.resolves({
      result: 'success',
    })

    getMainQueueStub = stub(queueDomain, 'getMainQueue').throws()
    getMainQueueStub.returns(queue)
  })

  afterEach(async () => {
    getMainQueueStub.restore()
  })

  function getPlatformClientWithComplexResults(): PlatformClient {
    return {
      async jobFind(params: JobFindParams): Promise<FindJobsResponse> {
        expect(params.id.length).eq(1)
        expect(params.id[0]).contains('job-')

        return {
          results: [
            {
              id: 'job-1',
              name: 'job-1-name',
              describe: {
                output: {
                  string_output: 'string output',
                  file_output: {
                    $dnanexus_link: file1Dxid,
                  },
                  string_array_output: ['string1', 'string2'],
                  file_array_output: [
                    {
                      $dnanexus_link: file2Dxid,
                    },
                    {
                      $dnanexus_link: file3Dxid,
                    },
                  ],
                } as JobOutput,
              },
            } as JobDescribeResponse,
          ],
        } as FindJobsResponse
      },
      async fileStates(params: FileStatesParams): Promise<FileStateResult[]> {
        expect(params.fileDxids.length).eq(3)
        expect(params.fileDxids).contains(file1Dxid)
        expect(params.fileDxids).contains(file2Dxid)
        expect(params.fileDxids).contains(file2Dxid)
        expect(params.projectDxid).contains('project-')

        return [
          {
            id: file1Dxid,
            project: '',
            describe: {
              name: 'file1',
              size: 100,
              created: 1,
              modified: 1,
              state: FILE_STATE_DX.CLOSED,
            },
          },
          {
            id: file2Dxid,
            project: '',
            describe: {
              name: 'file2',
              size: 200,
              created: 1,
              modified: 1,
              state: FILE_STATE_DX.CLOSED,
            },
          },
          {
            id: file3Dxid,
            project: '',
            describe: {
              name: 'file3',
              size: 300,
              created: 1,
              modified: 1,
              state: FILE_STATE_DX.CLOSED,
            },
          },
        ]
      },
    } as PlatformClient
  }

  function getPlatformClientWithEmptyResults(): PlatformClient {
    return {
      async jobFind(params: JobFindParams): Promise<FindJobsResponse> {
        expect(params.id.length).eq(1)
        expect(params.id[0]).contains('job-')

        return {
          results: [],
        } as FindJobsResponse
      },
    } as PlatformClient
  }

  it('Test Job Outputs sync - error when incorrect number of results returned', async () => {
    userContextLoadEntityStub.returns(user)
    const platformClient = getPlatformClientWithEmptyResults()
    jobService = getJobServiceInstance(platformClient)
    const job = create.jobHelper.create(em, { user }, {})
    jobRepoFindOneOrFailStub.withArgs({ dxid: job.dxid }).returns(job)
    await em.flush()

    await expect(jobService.syncOutputs(job.dxid)).to.be.rejectedWith(`Incorrect number of results for job ${job.dxid}`)
  })

  it('Test Job Outputs sync - sync job with all types of outputs', async () => {
    userContextLoadEntityStub.returns(user)
    eventHelperCreateFileEventStub.reset()
    const platformClient = getPlatformClientWithComplexResults()
    jobService = getJobServiceInstance(platformClient)
    const job = create.jobHelper.create(em, { user }, { scope: STATIC_SCOPE.PRIVATE })
    jobRepoFindOneOrFailStub.withArgs({ dxid: job.dxid }).returns(job)
    await em.flush()

    await jobService.syncOutputs(job.dxid)

    const filesCreated = await em.find(UserFile, {})
    expect(filesCreated.length).to.equal(3)

    const file1 = filesCreated.find(f => f.dxid === file1Dxid)
    expect(file1?.project).to.equal(job.project)
    expect(file1?.name).to.equal('file1')
    expect(file1?.fileSize).to.equal(100)
    expect(file1?.state).to.equal(FILE_STATE_DX.CLOSED)
    expect(file1?.parentId).to.equal(job.id)
    expect(file1?.parentType).to.equal(PARENT_TYPE.JOB)
    expect(file1?.scope).to.equal(STATIC_SCOPE.PRIVATE.toString())
    expect(file1?.uid).to.equal(`${file1?.dxid}-1`)

    const file2 = filesCreated.find(f => f.dxid === file2Dxid)
    expect(file2?.project).to.equal(job.project)
    expect(file2?.name).to.equal('file2')
    expect(file2?.fileSize).to.equal(200)
    expect(file2?.state).to.equal(FILE_STATE_DX.CLOSED)
    expect(file2?.parentId).to.equal(job.id)
    expect(file2?.parentType).to.equal(PARENT_TYPE.JOB)
    expect(file2?.scope).to.equal(STATIC_SCOPE.PRIVATE.toString())
    expect(file2?.uid).to.equal(`${file2?.dxid}-1`)

    const file3 = filesCreated.find(f => f.dxid === file3Dxid)
    expect(file3?.project).to.equal(job.project)
    expect(file3?.name).to.equal('file3')
    expect(file3?.fileSize).to.equal(300)
    expect(file3?.state).to.equal(FILE_STATE_DX.CLOSED)
    expect(file3?.parentId).to.equal(job.id)
    expect(file3?.parentType).to.equal(PARENT_TYPE.JOB)
    expect(file3?.scope).to.equal(STATIC_SCOPE.PRIVATE.toString())
    expect(file3?.uid).to.equal(`${file3?.dxid}-1`)

    expect(job.runData).to.deep.equal({
      run_instance_type: 'baseline-8',
      run_inputs: {},
      run_outputs: {
        string_output: 'string output',
        file_output: 'file-GY5q9B00Q6xpbXG503kKgF68',
        string_array_output: ['string1', 'string2'],
        file_array_output: ['file-GXPKG480q0jQPgXxFxKyyJ7q', 'file-GXgzZ7j00k4KVKfBzFyq8YXx'],
      },
    })

    expect(eventHelperCreateFileEventStub.calledThrice).to.be.true()
    expect(eventHelperCreateFileEventStub.firstCall.args[0]).to.equal(EVENT_TYPES.FILE_CREATED)
    expect(eventHelperCreateFileEventStub.firstCall.args[1].dxid).to.equal(file2Dxid)

    expect(eventHelperCreateFileEventStub.secondCall.args[0]).to.equal(EVENT_TYPES.FILE_CREATED)
    expect(eventHelperCreateFileEventStub.secondCall.args[1].dxid).to.equal(file3Dxid)

    expect(eventHelperCreateFileEventStub.thirdCall.args[0]).to.equal(EVENT_TYPES.FILE_CREATED)
    expect(eventHelperCreateFileEventStub.thirdCall.args[1].dxid).to.equal(file1Dxid)

    const notifications = await em.find(Notification, {})
    expect(notifications.length).to.equal(1)

    const notification = notifications[0]
    expect(notification.action).to.equal(NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED)
    expect(notification.message).to.equal(`Outputs for job ${job.dxid} have been synchronized`)
    expect(notification.user?.getEntity().id).to.equal(userId)
    expect(notification.severity).to.equal(SEVERITY.INFO)
  })

  it('Test Job Outputs sync - sync job outputs in a space', async () => {
    userContextLoadEntityStub.returns(user)
    eventHelperCreateFileEventStub.reset()
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    const folder = create.filesHelper.createFolder(
      em,
      { user },
      {
        name: 'folder-name',
        scope: `space-${space.id}`,
      },
    )
    await em.flush()
    nodeServiceCreateFoldersOnPathStub.callsFake(() => {
      return Promise.resolve([folder])
    })
    const spaceMembership = create.spacesHelper.addMember(em, { space, user })
    const job = create.jobHelper.create(
      em,
      { user },
      { scope: `space-${space.id}`, runData: { output_folder_path: folder.name } as JobRunData },
    )
    jobRepoFindOneOrFailStub.withArgs({ dxid: job.dxid }).returns(job)
    await em.flush()

    const platformClient = getPlatformClientWithComplexResults()
    jobService = getJobServiceInstance(platformClient)
    spaceMembershipRepoGetMembershipStub.withArgs(space.id, user.id).returns(spaceMembership)
    spaceRepoFindOneStub.withArgs(space.id).returns(space)

    await jobService.syncOutputs(job.dxid)

    const filesCreated = await em.find(UserFile, {})
    expect(filesCreated.length).to.equal(3)
    expect(filesCreated[0].scopedParentFolderId).to.equal(folder.id)
    expect(filesCreated[1].scopedParentFolderId).to.equal(folder.id)
    expect(filesCreated[2].scopedParentFolderId).to.equal(folder.id)
  })

  it('Test Job Outputs sync - sync job outputs in a space and create new folder', async () => {
    userContextLoadEntityStub.returns(user)
    eventHelperCreateFileEventStub.reset()
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    const spaceMembership = create.spacesHelper.addMember(em, { space, user })
    const job = create.jobHelper.create(
      em,
      { user },
      { scope: `space-${space.id}`, runData: { output_folder_path: '/test-folder' } as JobRunData },
    )
    const folder = { name: 'test-folder', scope: job.scope } as Folder
    nodeServiceCreateFoldersOnPathStub.callsFake(() => {
      return Promise.resolve([folder])
    })
    jobRepoFindOneOrFailStub.withArgs({ dxid: job.dxid }).returns(job)
    spaceMembershipRepoGetMembershipStub.withArgs(space.id, user.id).returns(spaceMembership)
    spaceRepoFindOneStub.withArgs(space.id).returns(space)
    await em.flush()

    const platformClient = getPlatformClientWithComplexResults()
    jobService = getJobServiceInstance(platformClient)

    await jobService.syncOutputs(job.dxid)

    const filesCreated = await em.find(UserFile, {})
    expect(filesCreated.length).to.equal(3)
    expect(filesCreated[0].scope).to.equal('space-1')
    expect(filesCreated[1].scope).to.equal('space-1')
    expect(filesCreated[2].scope).to.equal('space-1')
  })

  it('Test Job Outputs sync - create files in output folder specified by path', async () => {
    userContextLoadEntityStub.returns(user)
    eventHelperCreateFileEventStub.reset()
    await em.flush()
    const platformClient = getPlatformClientWithComplexResults()
    jobService = getJobServiceInstance(platformClient)
    const job = create.jobHelper.create(
      em,
      { user },
      { runData: { output_folder_path: 'folder1/folder2/folder3' } as JobRunData },
    )
    await em.flush()
    jobRepoFindOneOrFailStub.withArgs({ dxid: job.dxid }).returns(job)

    const folder1 = { id: 10, name: 'folder1' } as Folder
    const folder2 = { id: 11, parentFolderId: folder1.id, name: 'folder2' } as Folder
    const folder3 = { id: 12, parentFolderId: folder2.id, name: 'folder3' } as Folder
    nodeServiceCreateFoldersOnPathStub
      .withArgs(job.runData.output_folder_path, job.scope, job.user.id, {
        type: 'job',
        value: job,
      })
      .resolves([folder1, folder2, folder3])

    await jobService.syncOutputs(job.dxid)
    const filesCreated = await em.find(UserFile, {})
    expect(filesCreated.length).to.equal(3)

    expect(filesCreated[0].parentFolderId).to.equal(folder3.id)
    expect(filesCreated[1].parentFolderId).to.equal(folder3.id)
    expect(filesCreated[2].parentFolderId).to.equal(folder3.id)
  })

  it('Test Job Outputs sync - job dxid null -> error', async () => {
    userContextLoadEntityStub.returns(user)
    const thrownError = new Error('Job not found ({ dxid: null })')
    thrownError.name = 'NotFoundError'
    jobRepoFindOneOrFailStub.withArgs({ dxid: null }).throws(thrownError)
    jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())

    try {
      await jobService.syncOutputs(null)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('Job not found ({ dxid: null })')
    }
  })

  it('Test Job Outputs sync - non existing job dxid -> error', async () => {
    const nonExistingJobDxid = 'job-non-existing'
    userContextLoadEntityStub.returns(user)
    const thrownError = new Error(`Job not found ({ dxid: '${nonExistingJobDxid}' })`)
    thrownError.name = 'NotFoundError'
    jobRepoFindOneOrFailStub.withArgs({ dxid: nonExistingJobDxid }).throws(thrownError)
    jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())

    try {
      await jobService.syncOutputs(nonExistingJobDxid)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal(`Job not found ({ dxid: '${nonExistingJobDxid}' })`)
    }
  })

  context('checkAlive', () => {
    it('returns true if workstation client is alive', async () => {
      const job = create.jobHelper.create(em, { user }, { dxid: 'job-1' })
      await em.flush()
      const key = 'test-cli-key'

      jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())
      const result = await jobService.checkAlive(job.uid, key)
      expect(result).to.be.true()
      expect(aliveStub.calledOnceWithExactly(job.uid, key)).to.be.true()
    })

    it('returns false if workstation client is not alive', async () => {
      const job = create.jobHelper.create(em, { user }, { dxid: 'job-1' })
      await em.flush()
      const key = 'test-cli-key'

      aliveStub.resolves(false)
      jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())
      const result = await jobService.checkAlive(job.uid, key)
      expect(result).to.be.false()
      expect(aliveStub.calledOnceWithExactly(job.uid, key)).to.be.true()
    })
  })

  context('setAPIKey', () => {
    it('should call setAPIKey on workstation client', async () => {
      const job = create.jobHelper.create(em, { user }, { dxid: 'job-1' })
      await em.flush()
      const dto = new JobSetAPIKeyBodyDTO()
      dto.key = 'test-cli-key'
      dto.code = 'authToken'

      jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())
      await jobService.setAPIKey(job.uid, dto)
      expect(setAPIKeyStub.calledOnceWithExactly(job.uid, dto.code, dto.key)).to.be.true()
    })

    it('should throw error if setAPIKey on workstation client fails', async () => {
      const job = create.jobHelper.create(em, { user }, { dxid: 'job-1' })
      await em.flush()
      const dto = new JobSetAPIKeyBodyDTO()
      dto.key = 'test-cli-key'
      dto.code = 'authToken'

      setAPIKeyStub.throws(new InvalidStateError(`Cannot obtain job url for job ${job.id}`))

      jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())
      await expect(jobService.setAPIKey(job.uid, dto)).to.be.rejectedWith(
        InvalidStateError,
        `Cannot obtain job url for job ${job.id}`,
      )
      expect(setAPIKeyStub.calledOnceWithExactly(job.uid, dto.code, dto.key)).to.be.true()
    })
  })

  context('createWorkstationSnapshot', () => {
    it('should call snapshot on workstation client', async () => {
      const job = create.jobHelper.create(em, { user }, { dxid: 'job-1' })
      await em.flush()
      const authCode = 'authToken'
      const key = 'test-cli-key'
      const name = 'snapshot-name'
      const terminate = true

      jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())
      await jobService.createWorkstationSnapshot(job.uid, authCode, key, name, terminate)
      expect(snapshotStub.calledOnceWithExactly(job.uid, authCode, key, name, terminate)).to.be.true()
    })

    it('should throw error if snapshot on workstation client fails', async () => {
      const job = create.jobHelper.create(em, { user }, { dxid: 'job-1' })
      await em.flush()
      const authCode = 'authToken'
      const key = 'test-cli-key'
      const name = 'snapshot-name'
      const terminate = true

      snapshotStub.throws(new InvalidStateError(`Cannot obtain job url for job ${job.id}`))

      jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())
      await expect(jobService.createWorkstationSnapshot(job.uid, authCode, key, name, terminate)).to.be.rejectedWith(
        InvalidStateError,
        `Cannot obtain job url for job ${job.id}`,
      )
      expect(snapshotStub.calledOnceWithExactly(job.uid, authCode, key, name, terminate)).to.be.true()
    })
  })

  const getJobServiceInstance = (platformClient: PlatformClient): JobService => {
    const jobCountService = {
      count: stub().resolves(0),
    } as unknown as JobCountService
    return new JobService(
      em,
      userCtx,
      platformClient,
      notificationService,
      nodeService,
      jobSynchronizationService,
      emailService,
      jobRepo,
      spaceRepo,
      spaceMembershipRepo,
      eventHelper,
      jobCountService,
      jobWorkstationService,
    )
  }
})
