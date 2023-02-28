import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { database } from '@pfda/https-apps-shared'
import { User } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { EntityManager } from '@mikro-orm/mysql'
import { createFolderEvent, createJobClosed, EVENT_TYPES } from '@pfda/https-apps-shared/src/domain/event/event.helper'

describe('event.helper', () => {
  let em: EntityManager
  let user: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email(), lastLogin: new Date() })
    await em.flush()
  })

  context('createJobClosed()', () => {
    it('should create event for normal job', async () => {
      const app = create.appHelper.createHTTPS(em, { user })
      const job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.DONE })
      await em.flush()

      const event = await createJobClosed(user, job)
      await em.persist(event)
      await em.flush()

      expect(event.type).to.equal(EVENT_TYPES.JOB_CLOSED)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(job.dxid)
      expect(event.param2).to.equal(app.dxid)
    })

    // For this, see PFDA-3217 for context
    it('should create event for job whose app was deleted', async () => {
      const job = create.jobHelper.create(em, { user }, { scope: 'private', state: JOB_STATE.DONE })
      await em.flush()

      const event = await createJobClosed(user, job)
      await em.persist(event)
      await em.flush()

      expect(event.type).to.equal(EVENT_TYPES.JOB_CLOSED)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(job.dxid)
      expect(event.param2).to.equal(undefined)
    })
  })

  context('createFolderEvent()', () => {
    it('should create event for folder created', async () => {
      const folder = create.filesHelper.createFolder(
        em,
        { user },
        { name: 'a', project: user.privateFilesProject },
      )
      const folderPath = '/parentFolder/a'
      const event = await createFolderEvent(EVENT_TYPES.FOLDER_CREATED, folder, folderPath, user)
      expect(event.type).to.equal(EVENT_TYPES.FOLDER_CREATED)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(folderPath)
    })

    it('should create event for folder deleted', async () => {
      const folder = create.filesHelper.createFolder(
        em,
        { user },
        { name: 'a', project: user.privateFilesProject },
      )
      const folderPath = '/parentFolder/a'
      const event = await createFolderEvent(EVENT_TYPES.FOLDER_DELETED, folder, folderPath, user)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(folderPath)
    })
  })
})
