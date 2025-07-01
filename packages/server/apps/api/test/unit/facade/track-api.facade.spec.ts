import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { EntityUtils } from '@shared/utils/entity.utils'
import { TrackApiFacade } from 'apps/api/src/facade/track/track-api.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { AppRepository } from '@shared/domain/app/app.repository'
import { JobRepository } from '@shared/domain/job/job.repository'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { NoteRepository } from '@shared/domain/note/note.repository'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'
import { Note } from '@shared/domain/note/note.entity'

describe('TrackApiFacade', () => {
  const FILE_UID = 'file-uid-1'
  const FILE_NAME = 'name'

  const NOTE_ID = 1
  const NOTE_IDENTIFIER = `note-${NOTE_ID}`
  const NOTE_NAME = 'note-name'

  const getEntityProvenanceStub = stub().resolves()
  const findAccessibleOne = stub().resolves()
  const getEntityNameStub = stub(EntityUtils, 'getEntityName')

  beforeEach(() => {
    getEntityProvenanceStub.reset()
    findAccessibleOne.reset()
    getEntityNameStub.reset()
  })

  it('should raise error if entity not found', async () => {
    findAccessibleOne.rejects()

    await expect(getInstance().getProvenance(FILE_UID)).to.be.rejected
  })

  it('should call getAccessibleByUid and getProvenance with correct args', async () => {
    const file = { id: 1, name: FILE_NAME } as unknown as UserFile
    findAccessibleOne.withArgs({ uid: FILE_UID }).resolves(file)
    getEntityNameStub.withArgs(file).returns(FILE_NAME)

    const res = await getInstance().getProvenance(FILE_UID)
    expect(findAccessibleOne.calledOnce).to.be.true()
    expect(getEntityProvenanceStub.calledOnce).to.be.true()
    expect(res.identifier).to.be.equal(FILE_UID)
    expect(res.name).to.be.equal(FILE_NAME)
  })

  it('should call getAccessibleById and getProvenance with correct args', async () => {
    const note = { id: NOTE_ID, name: NOTE_NAME } as unknown as Note
    findAccessibleOne.withArgs({ id: NOTE_ID }).resolves(note)
    getEntityNameStub.withArgs(note).returns(NOTE_NAME)

    const res = await getInstance().getProvenance(NOTE_IDENTIFIER)
    expect(findAccessibleOne.calledOnce).to.be.true()
    expect(getEntityProvenanceStub.calledOnce).to.be.true()
    expect(res.identifier).to.be.equal(NOTE_IDENTIFIER)
    expect(res.name).to.be.equal(NOTE_NAME)
  })

  function getInstance(): TrackApiFacade {
    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService

    const appRepository = {
      findAccessibleOne: findAccessibleOne,
    } as unknown as AppRepository

    const jobRepository = {
      findAccessibleOne: findAccessibleOne,
    } as unknown as JobRepository

    const nodeRepository = {
      findAccessibleOne: findAccessibleOne,
    } as unknown as NodeRepository

    const noteRepository = {
      findAccessibleOne: findAccessibleOne,
    } as unknown as NoteRepository

    const dbClusterRepository = {
      findAccessibleOne: findAccessibleOne,
    } as unknown as DbClusterRepository
    const comparisonRepository = {
      findAccessibleOne: findAccessibleOne,
    } as unknown as ComparisonRepository

    return new TrackApiFacade(
      entityProvenanceService,
      appRepository,
      jobRepository,
      nodeRepository,
      noteRepository,
      dbClusterRepository,
      comparisonRepository,
    )
  }
})
