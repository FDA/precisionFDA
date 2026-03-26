import { App } from '@shared/domain/app/app.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { stub } from 'sinon'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { expect } from 'chai'
import { NoteRepository } from '@shared/domain/note/note.repository'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { AppRepository } from '@shared/domain/app/app.repository'
import { AttachmentRepository } from '@shared/domain/attachment/attachment.repository'
import { JobRepository } from '@shared/domain/job/job.repository'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { create, db } from '@shared/test'
import { User } from '@shared/domain/user/user.entity'
import { Note } from '@shared/domain/note/note.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'

describe('AttachmentManagementFacade', () => {
  let attachmentManagementFacade: AttachmentManagementFacade
  let em: EntityManager<MySqlDriver>
  let user: User
  let note: Note

  // attachments
  let file: UserFile
  let folder: Folder
  let asset: Asset
  let app: App
  let job: Job
  let comparison: Comparison

  const SPACE_SCOPE = 'space-123'

  const EMPTY_ATTACHMENTS = {
    files: [],
    folders: [],
    assets: [],
    apps: [],
    jobs: [],
    comparisons: [],
  }

  const findEditableOneNoteStub = stub()
  const findAccessibleOneNoteStub = stub()
  const findAccessibleOneNodeStub = stub()
  const findAccessibleOneAppStub = stub()
  const findAccessibleOneJobStub = stub()
  const findAccessibleOneComparisonStub = stub()

  const findOneNodeStub = stub()
  const findOneAppStub = stub()
  const findOneJobStub = stub()

  const flushStub = stub()
  const persistStub = stub()
  const removeAndFlushStub = stub()

  const findAttachmentStub = stub()
  const findOneAttachmentStub = stub()

  const noteRepository = {
    findEditableOne: findEditableOneNoteStub,
    findAccessibleOne: findAccessibleOneNoteStub,
  } as unknown as NoteRepository
  const nodeRepository = {
    findAccessibleOne: findAccessibleOneNodeStub,
    findOne: findOneNodeStub,
  } as unknown as NodeRepository
  const appRepository = {
    findAccessibleOne: findAccessibleOneAppStub,
    findOne: findOneAppStub,
  } as unknown as AppRepository
  const jobRepository = {
    findAccessibleOne: findAccessibleOneJobStub,
    findOne: findOneJobStub,
  } as unknown as JobRepository
  const comparisonRepository = {
    findAccessibleOne: findAccessibleOneComparisonStub,
  } as unknown as ComparisonRepository
  const attachmentsRepository = {
    findOne: findOneAttachmentStub,
    find: findAttachmentStub,
    removeAndFlush: removeAndFlushStub,
    flush: flushStub,
    persist: persistStub,
  } as unknown as AttachmentRepository

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    user = create.userHelper.create(em, {})
    note = create.noteHelper.create(em, { user }, { scope: SPACE_SCOPE })
    await em.flush()

    attachmentManagementFacade = new AttachmentManagementFacade(
      noteRepository,
      nodeRepository,
      appRepository,
      jobRepository,
      comparisonRepository,
      attachmentsRepository,
    )

    findEditableOneNoteStub.reset()
    findAccessibleOneNodeStub.reset()
    findOneAttachmentStub.reset()
    findAccessibleOneAppStub.reset()
    findAccessibleOneJobStub.reset()
    findAccessibleOneComparisonStub.reset()
    findAttachmentStub.reset()

    findOneNodeStub.reset()
    findOneAppStub.reset()
    findOneJobStub.reset()

    persistStub.reset()
    flushStub.reset()
    removeAndFlushStub.reset()

    findOneAttachmentStub.throws()
    findEditableOneNoteStub.throws()
    findAccessibleOneNodeStub.throws()
    findAccessibleOneAppStub.throws()
    findAccessibleOneJobStub.throws()
    findAccessibleOneComparisonStub.throws()
    persistStub.throws()
    flushStub.throws()

    findAttachmentStub.throws()
    removeAndFlushStub.throws()
    findOneNodeStub.throws()
    findOneAppStub.throws()
    findOneJobStub.throws()
    findOneAttachmentStub.throws()

    file = create.filesHelper.create(em, { user }, { scope: SPACE_SCOPE })
    app = create.appHelper.createRegular(em, { user }, { scope: SPACE_SCOPE })
    job = create.jobHelper.create(em, { user }, { scope: SPACE_SCOPE })
    asset = create.assetHelper.create(em, { user }, { scope: SPACE_SCOPE })
    await em.flush()
    folder = create.filesHelper.createFolder(em, { user }, { scope: SPACE_SCOPE })
    comparison = create.comparisonHelper.create(em, { app, user }, { scope: SPACE_SCOPE })
    await em.flush()

    findAccessibleOneNodeStub.withArgs({ id: file.id }).resolves(file)
    findAccessibleOneNodeStub.withArgs({ id: asset.id }).resolves(asset)
    findAccessibleOneNodeStub
      .withArgs({ id: folder.id, scope: [STATIC_SCOPE.PUBLIC, SPACE_SCOPE] })
      .resolves(folder)

    findEditableOneNoteStub.withArgs({ id: note.id }).resolves(note)
    findAccessibleOneNoteStub.withArgs({ id: note.id }).resolves(note)
    findAccessibleOneAppStub.withArgs({ id: app.id }).resolves(app)
    findAccessibleOneJobStub.withArgs({ id: job.id }).resolves(job)
    findAccessibleOneComparisonStub.withArgs({ id: comparison.id }).resolves(comparison)
    findOneAttachmentStub.resolves(null)
    persistStub.resolves()
    flushStub.resolves()
  })

  it('should not call attachment repos if empty attachments supplied', async () => {
    findEditableOneNoteStub.withArgs({ id: note.id }).resolves(note)
    flushStub.resolves()

    await attachmentManagementFacade.createAttachments(note.id, EMPTY_ATTACHMENTS)
    expect(findEditableOneNoteStub.calledOnce).to.be.true()
    expect(findOneAttachmentStub.notCalled).to.be.true()
    expect(findAccessibleOneNodeStub.notCalled).to.be.true()
    expect(findAccessibleOneComparisonStub.notCalled).to.be.true()
    expect(findAccessibleOneAppStub.notCalled).to.be.true()
    expect(findAccessibleOneJobStub.notCalled).to.be.true()
  })

  it('should call attachment repos if valid attachments supplied', async () => {
    const ATTACHMENTS = {
      files: [file.id],
      folders: [folder.id],
      assets: [asset.id],
      apps: [app.id],
      jobs: [job.id],
      comparisons: [comparison.id],
    }
    await attachmentManagementFacade.createAttachments(note.id, ATTACHMENTS)
    expect(findEditableOneNoteStub.calledOnce).to.be.true()
    expect(findOneAttachmentStub.callCount).to.be.equal(6)
    expect(findAccessibleOneNodeStub.callCount).to.be.equal(3)
    expect(findAccessibleOneComparisonStub.calledOnce).to.be.true()
    expect(findAccessibleOneAppStub.calledOnce).to.be.true()
    expect(findAccessibleOneJobStub.calledOnce).to.be.true()
  })

  it('should transform attachments to correct format', async () => {
    const ATTACHMENTS = {
      files: [file.uid],
      folders: [folder.id],
      assets: [asset.uid],
      apps: [app.uid],
      jobs: [job.uid],
      comparisons: [comparison.id],
    } as CliAttachmentsDTO

    findOneAppStub.withArgs({ uid: app.uid }).resolves(app)
    findOneJobStub.withArgs({ uid: job.uid }).resolves(job)
    findOneNodeStub.withArgs({ uid: file.uid, stiType: FILE_STI_TYPE.USERFILE }).resolves(file)
    findOneNodeStub.withArgs({ uid: asset.uid, stiType: FILE_STI_TYPE.ASSET }).resolves(asset)

    const transformed = await attachmentManagementFacade.transformCliAttachments(ATTACHMENTS)

    expect(transformed.files.length).to.equal(1)
    expect(transformed.files[0]).to.equal(file.id)
    expect(transformed.assets.length).to.equal(1)
    expect(transformed.assets[0]).to.equal(asset.id)
    expect(transformed.folders.length).to.equal(1)
    expect(transformed.folders[0]).to.equal(folder.id)
    expect(transformed.apps.length).to.equal(1)
    expect(transformed.apps[0]).to.equal(app.id)
    expect(transformed.jobs.length).to.equal(1)
    expect(transformed.jobs[0]).to.equal(job.id)
    expect(transformed.comparisons.length).to.equal(1)
    expect(transformed.comparisons[0]).to.equal(comparison.id)
  })

  it('should update the attachments by deleting the old records and create new ones', async () => {
    const ATTACHMENTS = {
      files: [file.id],
      folders: [folder.id],
      assets: [asset.id],
      apps: [app.id],
      jobs: [job.id],
      comparisons: [comparison.id],
    }

    findAttachmentStub.resolves([])
    removeAndFlushStub.resolves()

    await attachmentManagementFacade.updateAttachments(note.id, ATTACHMENTS)

    expect(removeAndFlushStub.called).to.be.true()
    expect(findAttachmentStub.called).to.be.true()
    expect(persistStub.called).to.be.true()
    expect(flushStub.called).to.be.true()
  })
})
