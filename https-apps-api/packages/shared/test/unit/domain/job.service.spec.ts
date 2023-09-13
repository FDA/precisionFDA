import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { User, UserFile, Event, Notification } from '../../../src/domain'
import { database } from '@pfda/https-apps-shared'
import { create, db } from '../../../src/test'
import { JobService } from '../../../src/domain/job'
import { PlatformClient } from '../../../src/platform-client'
import {
  FileStatesParams,
  JobFindParams
} from '../../../src/platform-client/platform-client.params'
import {
  FileStateResult,
  FindJobsResponse,
  JobDescribeResponse,
  JobOutput
} from '../../../src/platform-client/platform-client.responses'
import { FILE_STATE_DX, PARENT_TYPE } from '../../../src/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '../../../src/enums'
import { EVENT_TYPES } from '../../../src/domain/event/event.helper'

describe('Job service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let jobService: JobService
  const file1Dxid = 'file-GY5q9B00Q6xpbXG503kKgF68'
  const file2Dxid = 'file-GXPKG480q0jQPgXxFxKyyJ7q'
  const file3Dxid = 'file-GXgzZ7j00k4KVKfBzFyq8YXx'
  const userId = 100

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em, {id: userId})
    await em.flush()
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

        return [{
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
        }]
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
          results: []
        } as FindJobsResponse
      },
    } as PlatformClient
  }

  it('Test Job Outputs sync - error when incorrect number of results returned', async() => {
    const platformClient = getPlatformClientWithEmptyResults()
    jobService = new JobService(em, platformClient)
    const job = create.jobHelper.create(em, { user }, {})
    await em.flush()

    await expect(jobService.syncOutputs(job.dxid, user.id)).to.be.rejectedWith(`Incorrect number of results for job ${job.dxid}`)
  })

  it('Test Job Outputs sync - sync job with all types of outputs', async() => {
    const platformClient = getPlatformClientWithComplexResults()
    jobService = new JobService(em, platformClient)
    const job = create.jobHelper.create(em, { user }, {})
    await em.flush()

    await jobService.syncOutputs(job.dxid, user.id)

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

    const runDataObject = JSON.parse(job.runData)
    expect(runDataObject).to.deep.equal({
      run_instance_type: 'baseline-8',
      run_inputs: {},
      run_outputs: {
        string_output: 'string output',
        file_output: 'file-GY5q9B00Q6xpbXG503kKgF68',
        string_array_output: [
          'string1',
          'string2',
        ],
        file_array_output: [
          'file-GXPKG480q0jQPgXxFxKyyJ7q',
          'file-GXgzZ7j00k4KVKfBzFyq8YXx',
        ],
      },
    })

    const events = await em.find(Event, {})
    expect(events.length).to.equal(3)
    const event1 = events.find(event => event.param2 === file1?.dxid)
    expect(event1?.type).to.equal(EVENT_TYPES.FILE_CREATED)
    expect(event1?.param2).to.equal(file1Dxid)
    expect(event1?.data).to.equal('{"id":1,"scope":"private","name":"file1","path":"file1"}')

    const event2 = events.find(event => event.param2 === file2?.dxid)
    expect(event2?.type).to.equal(EVENT_TYPES.FILE_CREATED)
    expect(event2?.param2).to.equal(file2Dxid)
    expect(event2?.data).to.equal('{"id":2,"scope":"private","name":"file2","path":"file2"}')

    const event3 = events.find(event => event.param2 === file3?.dxid)
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

  it('Test Job Outputs sync - sync job outputs in a space', async() => {
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'folder-name' })
    await em.flush()
    create.spacesHelper.addMember(em, {space, user})
    const job = create.jobHelper.create(em, { user }, { scope: `space-${space.id}`, localFolderId: folder.id})
    await em.flush()

    const platformClient = getPlatformClientWithComplexResults()
    jobService = new JobService(em, platformClient)

    await jobService.syncOutputs(job.dxid, user.id)

    const filesCreated = await em.find(UserFile, {})
    expect(filesCreated.length).to.equal(3)
    expect(filesCreated[0].scopedParentFolderId).to.equal(folder.id)
    expect(filesCreated[1].scopedParentFolderId).to.equal(folder.id)
    expect(filesCreated[2].scopedParentFolderId).to.equal(folder.id)
  })

  it('Test Job Outputs sync - job dxid null', async () => {
    jobService = new JobService(em, getPlatformClientWithEmptyResults())

    try {
      // @ts-ignore
      await jobService.syncOutputs(null, user.id)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('Job not found ({ dxid: null })')
    }
  })

  it('Test Job Outputs sync - user id null', async () => {
    jobService = new JobService(em, getPlatformClientWithEmptyResults())
    const job = create.jobHelper.create(em, { user }, { })
    await em.flush()

    try {
      // @ts-ignore
      await jobService.syncOutputs(job.dxid, null)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('User not found ({ id: null })')
    }
  })

  it('Test Job Outputs sync - job dxid and user id null', async () => {
    jobService = new JobService(em, getPlatformClientWithEmptyResults())

    try {
      // @ts-ignore
      await jobService.syncOutputs(null, null)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('User not found ({ id: null })')
    }
  })

  it('Test Job Outputs sync - non existing job dxid', async () => {
    jobService = new JobService(em, getPlatformClientWithEmptyResults())

    try {
      // @ts-ignore
      await jobService.syncOutputs('non-existing', userId)
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('Job not found ({ dxid: \'non-existing\' })')
    }
  })

  it('Test Job Outputs sync - non existing user id', async () => {
    jobService = new JobService(em, getPlatformClientWithEmptyResults())
    const job = create.jobHelper.create(em, { user }, { })
    await em.flush()

    try {
      // @ts-ignore
      await jobService.syncOutputs(job.dxid, 'non-existing')
      expect.fail('Expected to fail')
    } catch (error) {
      expect(error.name).eq('NotFoundError')
      expect(error.message).to.equal('User not found ({ id: \'non-existing\' })')
    }
  })

})
