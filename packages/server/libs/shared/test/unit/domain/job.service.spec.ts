import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { JobService } from '@shared/domain/job/job.service'
import { JobRunData } from '@shared/domain/job/job.types'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Event } from '@shared/domain/event/event.entity'
import { Notification } from '@shared/domain/notification/notification.entity'
import { expect } from 'chai'
import { create, db } from '@shared/test'
import { PlatformClient } from '@shared/platform-client'
import { FileStatesParams, JobFindParams } from '@shared/platform-client/platform-client.params'
import {
  FileStateResult,
  FindJobsResponse,
  JobDescribeResponse,
  JobOutput,
} from '@shared/platform-client/platform-client.responses'
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '@shared/enums'
import { EVENT_TYPES } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { Queue } from 'bull'
import * as queueDomain from '@shared/queue'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { Job } from '@shared/domain/job/job.entity'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { EmailPrepareService } from '@shared/domain/email/templates/email-prepare.service'
import { EmailSendService } from '@shared/domain/email/email-send.service'

describe('Job service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let jobService: JobService
  let userCtx: UserCtx
  let notificationService: NotificationService
  let folderService: FolderService
  let emailQueueJobProducer: EmailQueueJobProducer
  let emailPrepareService: EmailPrepareService
  let emailSendService: EmailSendService
  let getMainQueueStub
  const file1Dxid = 'file-GY5q9B00Q6xpbXG503kKgF68'
  const file2Dxid = 'file-GXPKG480q0jQPgXxFxKyyJ7q'
  const file3Dxid = 'file-GXgzZ7j00k4KVKfBzFyq8YXx'
  const userId = 100
  const prepareEmailsStub = stub()
  const sendEmailStub = stub()

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
    } as UserCtx

    notificationService = new NotificationService(em, userCtx)
    folderService = new FolderService(em)
    emailQueueJobProducer = new EmailQueueJobProducer(queue)
    emailPrepareService = {
      prepareEmails: prepareEmailsStub,
    } as unknown as EmailPrepareService
    emailSendService = {
      sendEmail: sendEmailStub,
    } as unknown as EmailSendService

    queueAdd.reset()
    queueAdd.throws()
    getMainQueueStub = stub(queueDomain, 'getMainQueue').throws()
    getMainQueueStub.returns(queue)
  })

  afterEach(async () => {
    getMainQueueStub.restore()
  })

  function getPlatformClientWithComplexResults() {
    return {
      async jobFind(params: JobFindParams): Promise<FindJobsResponse> {
        expect(params.id.length).eq(1)
        expect(params.id[0]).contains('job-')
        expect(params.project).contains('project-')

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

  function getPlatformClientWithEmptyResults() {
    return {
      async jobFind(params: JobFindParams): Promise<FindJobsResponse> {
        expect(params.id.length).eq(1)
        expect(params.id[0]).contains('job-')
        expect(params.project).contains('project-')

        return {
          results: [],
        } as FindJobsResponse
      },
    } as PlatformClient
  }

  it('Test Job Outputs sync - error when incorrect number of results returned', async () => {
    const platformClient = getPlatformClientWithEmptyResults()
    jobService = getJobServiceInstance(platformClient)
    const job = create.jobHelper.create(em, { user }, {})
    await em.flush()

    await expect(jobService.syncOutputs(job.dxid, user.id)).to.be.rejectedWith(
      `Incorrect number of results for job ${job.dxid}`,
    )
  })

  it('Test Job Outputs sync - sync job with all types of outputs', async () => {
    const platformClient = getPlatformClientWithComplexResults()
    jobService = getJobServiceInstance(platformClient)
    const job = create.jobHelper.create(em, { user }, { scope: STATIC_SCOPE.PRIVATE })
    await em.flush()

    await jobService.syncOutputs(job.dxid, user.id)

    const filesCreated = await em.find(UserFile, {})
    expect(filesCreated.length).to.equal(3)

    const file1 = filesCreated.find((f) => f.dxid === file1Dxid)
    expect(file1?.project).to.equal(job.project)
    expect(file1?.name).to.equal('file1')
    expect(file1?.fileSize).to.equal(100)
    expect(file1?.state).to.equal(FILE_STATE_DX.CLOSED)
    expect(file1?.parentId).to.equal(job.id)
    expect(file1?.parentType).to.equal(PARENT_TYPE.JOB)
    expect(file1?.scope).to.equal(STATIC_SCOPE.PRIVATE.toString())
    expect(file1?.uid).to.equal(`${file1?.dxid}-1`)

    const file2 = filesCreated.find((f) => f.dxid === file2Dxid)
    expect(file2?.project).to.equal(job.project)
    expect(file2?.name).to.equal('file2')
    expect(file2?.fileSize).to.equal(200)
    expect(file2?.state).to.equal(FILE_STATE_DX.CLOSED)
    expect(file2?.parentId).to.equal(job.id)
    expect(file2?.parentType).to.equal(PARENT_TYPE.JOB)
    expect(file2?.scope).to.equal(STATIC_SCOPE.PRIVATE.toString())
    expect(file2?.uid).to.equal(`${file2?.dxid}-1`)

    const file3 = filesCreated.find((f) => f.dxid === file3Dxid)
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

    const events = await em.find(Event, {})
    expect(events.length).to.equal(3)
    const event1 = events.find((event) => event.param2 === file1?.dxid)
    expect(event1?.type).to.equal(EVENT_TYPES.FILE_CREATED)
    expect(event1?.param2).to.equal(file1Dxid)
    expect(event1?.data).to.equal('{"id":1,"scope":"private","name":"file1","path":"file1"}')

    const event2 = events.find((event) => event.param2 === file2?.dxid)
    expect(event2?.type).to.equal(EVENT_TYPES.FILE_CREATED)
    expect(event2?.param2).to.equal(file2Dxid)
    expect(event2?.data).to.equal('{"id":2,"scope":"private","name":"file2","path":"file2"}')

    const event3 = events.find((event) => event.param2 === file3?.dxid)
    expect(event3?.type).to.equal(EVENT_TYPES.FILE_CREATED)
    expect(event3?.param2).to.equal(file3Dxid)
    expect(event3?.data).to.equal('{"id":3,"scope":"private","name":"file3","path":"file3"}')

    const notifications = await em.find(Notification, {})
    expect(notifications.length).to.equal(1)

    const notification = notifications[0]
    expect(notification.action).to.equal(NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED)
    expect(notification.message).to.equal(`Outputs for job ${job.dxid} have been synchronized`)
    expect(notification.user?.getEntity().id).to.equal(userId)
    expect(notification.severity).to.equal(SEVERITY.INFO)
  })

  it('Test Job Outputs sync - sync job outputs in a space', async () => {
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
    create.spacesHelper.addMember(em, { space, user })
    const job = create.jobHelper.create(
      em,
      { user },
      { scope: `space-${space.id}`, runData: { output_folder_path: folder.name } as JobRunData },
    )
    await em.flush()

    const platformClient = getPlatformClientWithComplexResults()
    jobService = getJobServiceInstance(platformClient)

    await jobService.syncOutputs(job.dxid, user.id)

    const filesCreated = await em.find(UserFile, {})
    expect(filesCreated.length).to.equal(3)
    expect(filesCreated[0].scopedParentFolderId).to.equal(folder.id)
    expect(filesCreated[1].scopedParentFolderId).to.equal(folder.id)
    expect(filesCreated[2].scopedParentFolderId).to.equal(folder.id)
  })

  it('Test Job Outputs sync - sync job outputs in a space and create new folder', async () => {
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    create.spacesHelper.addMember(em, { space, user })
    const job = create.jobHelper.create(
      em,
      { user },
      { scope: `space-${space.id}`, runData: { output_folder_path: '/test-folder' } as JobRunData },
    )
    await em.flush()

    const platformClient = getPlatformClientWithComplexResults()
    jobService = getJobServiceInstance(platformClient)

    await jobService.syncOutputs(job.dxid, user.id)

    const filesCreated = await em.find(UserFile, {})
    expect(filesCreated.length).to.equal(3)
    expect(filesCreated[0].scope).to.equal('space-1')
    expect(filesCreated[1].scope).to.equal('space-1')
    expect(filesCreated[2].scope).to.equal('space-1')

    const outputFolder = await em.findOneOrFail(Folder, { name: 'test-folder' })
    expect(outputFolder.scope).to.equal('space-1')
  })

  it('Test Job Outputs sync - create files in output folder specified by path', async () => {
    await em.flush()
    const platformClient = getPlatformClientWithComplexResults()
    jobService = getJobServiceInstance(platformClient)
    const job = create.jobHelper.create(
      em,
      { user },
      { runData: { output_folder_path: 'folder1/folder2/folder3' } as JobRunData },
    )
    await em.flush()

    await jobService.syncOutputs(job.dxid, user.id)
    const filesCreated = await em.find(UserFile, {})
    expect(filesCreated.length).to.equal(3)

    const folder1 = await em.findOneOrFail(Folder, { name: 'folder1' })
    const folder2 = await em.findOneOrFail(Folder, { name: 'folder2', parentFolderId: folder1.id })
    const folder3 = await em.findOneOrFail(Folder, { name: 'folder3', parentFolderId: folder2.id })

    expect(folder1.parentType).to.equal(PARENT_TYPE.JOB)
    expect(folder1.parentId).to.equal(job.id)
    expect(folder2.parentType).to.equal(PARENT_TYPE.JOB)
    expect(folder2.parentId).to.equal(job.id)
    expect(folder3.parentType).to.equal(PARENT_TYPE.JOB)
    expect(folder3.parentId).to.equal(job.id)

    expect(filesCreated[0].parentFolderId).to.equal(folder3.id)
    expect(filesCreated[1].parentFolderId).to.equal(folder3.id)
    expect(filesCreated[2].parentFolderId).to.equal(folder3.id)
  })

  it('Test Job Outputs sync - job dxid null -> error', async () => {
    jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())

    try {
      await jobService.syncOutputs(null, user.id)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('Job not found ({ dxid: null })')
    }
  })

  it('Test Job Outputs sync - user id null -> error', async () => {
    jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())

    const job = create.jobHelper.create(em, { user }, {})
    await em.flush()

    try {
      await jobService.syncOutputs(job.dxid, null)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('User not found ({ id: null })')
    }
  })

  it('Test Job Outputs sync - job dxid and user id null -> error', async () => {
    jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())

    try {
      await jobService.syncOutputs(null, null)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('User not found ({ id: null })')
    }
  })

  it('Test Job Outputs sync - non existing job dxid -> error', async () => {
    jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())

    try {
      await jobService.syncOutputs('non-existing', userId)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal("Job not found ({ dxid: 'non-existing' })")
    }
  })

  it('Test Job Outputs sync - non existing user id -> error', async () => {
    jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())
    const job = create.jobHelper.create(em, { user }, {})
    await em.flush()

    try {
      await jobService.syncOutputs(job.dxid, 1000000)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('User not found ({ id: 1000000 })')
    }
  })

  context('#checkStaleJobs', async () => {
    it('Stale job found', async () => {
      const app = create.appHelper.createRegular(em, { user }, { title: 'app1' })
      await em.flush()
      const staleJob = await create.jobHelper.create(
        em,
        { user, app },
        { createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      )
      await em.flush()
      queueAdd.reset()
      const adminUser = await create.userHelper.createAdmin(em)
      const platformClient = {
        async jobFind(params: JobFindParams): Promise<FindJobsResponse> {
          expect(params.project).contains('project-')
          return {
            results: [
              {
                id: 'job-1',
                name: 'job-1-name',
                describe: {
                  state: 'done',
                  created: 1,
                  modified: 1,
                },
              } as unknown as JobDescribeResponse,
            ],
          } as FindJobsResponse
        },
      } as PlatformClient

      jobService = getJobServiceInstance(platformClient)

      await em.flush()

      await jobService.checkStaleJobs()

      expect(queueAdd.calledTwice).to.be.true
      expect(queueAdd.firstCall.firstArg).to.equal('send_email')
      expect(queueAdd.firstCall.args[1].payload.emailType).to.equal(EMAIL_TYPES.staleJobsReport)
      expect(queueAdd.firstCall.args[1].payload.body).not.to.contain('No stale jobs found')
      expect(queueAdd.firstCall.args[1].payload.body).to.contain(staleJob.dxid)
      expect(queueAdd.firstCall.args[1].payload.to).to.equal(adminUser.email)
      expect(queueAdd.firstCall.args[1].payload.subject).to.equal('Stale jobs report')

      expect(queueAdd.secondCall.firstArg).to.equal('send_email')
      expect(queueAdd.secondCall.args[1].payload.emailType).to.equal(EMAIL_TYPES.staleJobsReport)
      expect(queueAdd.secondCall.args[1].payload.body).not.to.contain('No stale jobs found')
      expect(queueAdd.secondCall.args[1].payload.body).to.contain(staleJob.dxid)
      expect(queueAdd.secondCall.args[1].payload.to).to.equal('precisionfda-no-reply@dnanexus.com')
      expect(queueAdd.secondCall.args[1].payload.subject).to.equal('Stale jobs report')
    })

    it('Stale job not found', async () => {
      const app = create.appHelper.createRegular(em, { user }, { title: 'app1' })
      await em.flush()
      const normalJob = await create.jobHelper.create(em, { user, app })
      await em.flush()
      queueAdd.reset()
      const adminUser = await create.userHelper.createAdmin(em)
      const platformClient = {
        async jobFind(params: JobFindParams): Promise<FindJobsResponse> {
          expect(params.project).contains('project-')
          return {
            results: [
              {
                id: 'job-1',
                name: 'job-1-name',
                describe: {
                  state: 'done',
                  created: 1,
                  modified: 1,
                },
              } as unknown as JobDescribeResponse,
            ],
          } as FindJobsResponse
        },
      } as PlatformClient

      jobService = getJobServiceInstance(platformClient)

      await em.flush()

      await jobService.checkStaleJobs()

      expect(queueAdd.calledTwice).to.be.true
      expect(queueAdd.firstCall.firstArg).to.equal('send_email')
      expect(queueAdd.firstCall.args[1].payload.emailType).to.equal(EMAIL_TYPES.staleJobsReport)
      expect(queueAdd.firstCall.args[1].payload.body).to.contain('No stale jobs found')
      expect(queueAdd.firstCall.args[1].payload.body).to.contain(normalJob.dxid)
      expect(queueAdd.firstCall.args[1].payload.to).to.equal(adminUser.email)
      expect(queueAdd.firstCall.args[1].payload.subject).to.equal('Stale jobs report')

      expect(queueAdd.secondCall.firstArg).to.equal('send_email')
      expect(queueAdd.secondCall.args[1].payload.emailType).to.equal(EMAIL_TYPES.staleJobsReport)
      expect(queueAdd.secondCall.args[1].payload.body).to.contain('No stale jobs found')
      expect(queueAdd.secondCall.args[1].payload.body).to.contain(normalJob.dxid)
      expect(queueAdd.secondCall.args[1].payload.to).to.equal('precisionfda-no-reply@dnanexus.com')
      expect(queueAdd.secondCall.args[1].payload.subject).to.equal('Stale jobs report')
    })
  })

  context('#checkChallengeJobs', async () => {
    it('Challenge bot not found', async () => {
      jobService = getJobServiceInstance(getPlatformClientWithEmptyResults())

      // For some reason rejectedWith doesn't work
      // const error = new NotFoundError("User not found ({ dxuser: 'challenge-bot-test' })")
      // await expect(jobService.checkChallengeJobs()).to.be.rejectedWith(error)
      try {
        await jobService.checkChallengeJobs()
      } catch (error) {
        expect(error.message).to.contain('User not found')
      }
    })

    it('Sync outputs of jobs', async () => {
      const platformClient = getPlatformClientWithComplexResults()
      jobService = getJobServiceInstance(platformClient)
      const challengeBotUser = create.userHelper.create(em, {
        dxuser: config.platform.challengeBotUser,
      })
      await em.flush()
      const job = create.jobHelper.create(em, { user: challengeBotUser }, {})
      await em.flush()

      await jobService.checkChallengeJobs()

      const filesCreated = await em.find(UserFile, {})
      const loadedJob = await em.findOneOrFail(Job, { dxid: job.dxid })
      expect(loadedJob.runData).to.deep.equal({
        run_instance_type: 'baseline-8',
        run_inputs: {},
        run_outputs: {
          string_output: 'string output',
          file_output: filesCreated[0].dxid,
          string_array_output: ['string1', 'string2'],
          file_array_output: [filesCreated[1].dxid, filesCreated[2].dxid],
        },
      })

      const notifications = await em.find(Notification, {})
      expect(notifications.length).to.equal(1)
      expect(notifications[0].action).to.equal(NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED)
      expect(notifications[0].message).to.equal(
        `Outputs for job ${job.dxid} have been synchronized`,
      )
    })
  })

  const getJobServiceInstance = (platformClient: PlatformClient) => {
    return new JobService(
      em,
      userCtx,
      platformClient,
      notificationService,
      folderService,
      emailQueueJobProducer,
      emailPrepareService,
      emailSendService,
    )
  }
})
